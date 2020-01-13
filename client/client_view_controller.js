/*jshint esversion: 6 */
$(function() {

  let url = "http://localhost:8001"

  const strDate = function(d) {
    date = new Date(d)
    let year = date.getFullYear();
    let month = ((date.getMonth()+1) < 10 ? '0' : '') + (date.getMonth()+1);
    let day = (date.getDate() < 10 ? '0' : '') + date.getDate();
    let hour = (date.getHours() < 10 ? '0' : '') + date.getHours();
    let min = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();

    return `${day}-${month}-${year} @t ${hour}:${min}`
  };

  const watcher = function() {

    let repaint;
    $('#bar>.message').html("");
    countController();
    countComentController();
    for(elem in checker){
      let elemid=JSON.stringify(elem).replace(/\"/g,"")
      if(checker[elemid]['old'] !== checker[elemid]['new']){
        checker[elemid]['danger']=1;
        $(`#${elemid}`).removeClass('bg-dark');
        $(`#${elemid}`).addClass('bg-danger');
        checker[elemid]['old'] = checker[elemid]['new']
        repaint = true;
      }
      if(checker[elemid]['oldc'] < checker[elemid]['newc']){
        checker[elemid]['warn']=1;
        $(`#${elemid}`).removeClass('bg-dark');
        $(`#${elemid}`).addClass('bg-warning');
        checker[elemid]['oldc'] = checker[elemid]['newc']
        repaint = true;
      }
    } 
    if(repaint){
      if(checker!== {}) Cookie.set(userN,JSON.stringify(checker),40);
      parkingsView();
    } 
  };

  // VIEW
  

  const backComentView = function(id) {
    $(`#bar_${incident}`).html(`
      <div id="bar_${incident}" class="p-4 bar coment bg-light text-center">\
      <button type="button" id="${incident}"class="ncoment btn btn-dark">Afegir comentari</button>\
      </div>`)
  };

  const backIncidentView = function(id) {
    $(`#bar_${id}`).html(
      `<div id="bar_${id}" class="barinc text-center p-4 sticky-top bg-dark text-white ">\
        <h2>${parkN}</h2>\
        <p>
          <button type="button" id="${id}" class="nincident btn btn-outline-danger btn-sm">Nova incidencia</button>\
          <button type="button" id="${id}" class="pending btn btn-outline-warning btn-sm" >${pending==="true"?"Totes":"Pendents"}</button>\
        </p>
        <p>
          <input type="search" name="sbar" ${filter===""?` placeholder="Buscar títol incidència" `: ` value="${filter}" ` } id="sbar_${id}" class="sbar col-xs-1"/>\
          max:<input type="number" style="width:60px;" name="quantity" class="quant col-xs-2" value="${limit}" size="3" min="0" max="500">\
        </p>\
      </div>`
    )
  }; 

  const loginView = function() {
    $('#bar>.message').html("");
    $("#bar>input.url").prop("readonly", true);
    $("#bar>input.username").prop("readonly", true);
    $('#bar>input.password').hide();
    $('#bar>.login').hide();
    $('.create').hide();
    $('#bar>.logout').show();
    $('#parkings').show();
    $('#parkings>.search').val("");
    $('#incidents').html("");
    $('.newUser').remove();
  };

    const removeComentView = function() {
    $('.coment').remove();
    $('.bar').remove();
    incident=undefined;
  };

  const logoutView = function() {
    $("#bar>input.url").val(url).prop("readonly", false);
    $("#bar>input.username").val(userN).prop("readonly", false);
    $('#bar>input.password').val("").show();
    $('#bar>.login').show();
    $('.create').show();
    $('#bar>.logout').hide();
    $('#parkings').hide('slow');
    $('#incidents').hide('slow');
    $('#messages').hide();
  };

  const newComentView = function(e) {
    $(`#bar_${e.currentTarget.id}`).removeClass('coment');
    $(`#bar_${e.currentTarget.id}`).html(
      `<h3>Nou comentari:</h3>\
      <textarea name="text" class="ccoment" rows="4" cols="38" id="text_${e.currentTarget.id}"/><br>\
      <input type="button" id="b_${e.currentTarget.id}" class="newComent btn btn-success" value="Crear">\
      <input type="button" value="Cancela" id="bc_${e.currentTarget.id}" class="cancelCom btn btn-danger">`
    )
    $('.ccoment').focus();
  };

  const newIncidentView = function(e) {
    $(`#bar_${e.currentTarget.id}`).html(
      `<h5 class="text-left">Nova incidència:</h3>\
      <h3>${parkN}</h3>
      <p>\
        Títol: \
        <input type="text"  class="title" name="title" id="title_${e.currentTarget.id}"/><br>\
        <br>\
        <textarea name="text" rows="4" cols="38" id="text_${e.currentTarget.id}"/><br>\
        Tancada: <input type="checkbox" id="check_${e.currentTarget.id}"/>\
        <input type="button" name="${parkN}" id="b_${e.currentTarget.id}" class="newIncident btn btn-success" value="Crear"/>\
        <input type="button" value="Cancela" id="bc_${e.currentTarget.id}" class="cancelInc btn btn-danger"/>\
      </p>`
    )
    $('.title').focus();
  };

  const newUserView = function() {
    //var pop = window.open("", "SuperUsuari", "widht=150,height=200,titlebar=no");
    var HTML = "";

    HTML += "<p></p>";
    HTML += "<br/>";
    HTML += "usuari:&emsp;&emsp;&emsp;&emsp;<input type='text' id='suser' placeholder='Superusuari'/>";
    HTML += "<br />";
    HTML += "password:&emsp;&emsp; <input type='password' id='spass' placeholder='Superusuari'/>";
    HTML += "<br />";
    HTML += "Nou usuari:&emsp;&nbsp;&nbsp;&nbsp;<input type='text' id='nuser' placeholder='Nou usuari'/>";
    HTML += "<br />";
    HTML += "Nou password: <input type='text' id='npass' placeholder='Nou password'/>";
    HTML += "<br />";
    HTML += "<br><input type='button' value='OK' class='nuser btn btn-success' id='authOK'/><br>";
    $('#newUser').remove()
    $('#bar').append(`<div id="newUser" class="newUser text-white">${HTML}</div> `)

  };
  const parkingsView = function() {

    $.ajax({
      contentType:  'application/json',
      method:       "GET",
      headers:{
        "access-token": `${token}`
      },
      url:          url + '/parkings/',
    })
    .then(resp => {
      let parkings = [];
      if(resp[0].code===200){
        for(let i=1; i<resp.length;i++){
          parkings.push(resp[i])
        }
        $('#parkings').html("")
        for(let i=0;i<parkings.length;i++){
          
          let color = i%2===0?"bg-secondary":" bg-dark" 
          if(!checker[parkings[i]._id])checker[parkings[i]._id]= {'new':0,'old':0,'newc':"",'oldc':"", "danger":0, "warn":0, "color":color}
          let addr = parkings[i].parking.addr===undefined?"ND": parkings[i].parking.addr;
          let tel = parkings[i].parking.tel===undefined?"ND": parkings[i].parking.tel;
          let nif = parkings[i].parking.nif===undefined?"ND": parkings[i].parking.nif;
          let name = parkings[i].parking.name
          let r = `<strong id="${parkings[i]._id}" class="park" name="${name}">Instal·lació: </strong>${parkings[i].parking.name}<br>`;
          r = r + `<strong id="${parkings[i]._id}" class="park" name="${name}">Adreça: </strong>${addr}<br>`;
          r = r + `<strong id="${parkings[i]._id}" class="park" name"${name}">Telèfon: </strong>${tel}<br>`;
          r = r + `<strong id="${parkings[i]._id}" class="park" name="${name}">NIF: </strong>${nif}<br>`;
          if(!checker[parkings[i]._id]['color'])checker[parkings[i]._id]['color']=color

          if(checker[parkings[i]._id]['danger']===1){
            $('#parkings').append(
              `<div id="${parkings[i]._id}" class="p-4 park bg-danger text-white border border-dark " name="${name}">${r}</div>`
            )
          } else if(checker[parkings[i]._id]['warn']===1){
            $('#parkings').append(
              `<div id="${parkings[i]._id}" class="p-4 park bg-warning text-white border border-dark " name="${name}">${r}</div>`
            )
          }else{
            $('#parkings').append(
              `<div id="${parkings[i]._id}" class="p-4 park ${checker[parkings[i]._id]['color']} text-white border border-dark " name="${name}">${r}</div>`
            )
          }

        }
      } else {
        $('#bar>.message').html(resp.message);
        $('#incidents').show();
        return
      }
    if(parkId) $(`#${parkId}`).addClass("sticky-top");
    })

    .catch(error => {$('#bar>.message').html("Connection error: " + error.code);});
  };

  const comentsView = function(id) {
    incident= id;
    $(`.coment`).hide('slow').remove()
    $(`.bar`).remove()
    $(`#incident_${id}`).append(
      `<div id="bar_${id}" class="p-4 bar coment bg-light text-center">\
      <button type="button" id="${id}"class="ncoment btn btn-dark">Afegir comentari</button>\
      </div>`)
    $.ajax({
      contentType:  'application/json',
      method:       "GET",
      headers:{"access-token": `${token}`},
      url: url + `/coments/${id}`,
    })
    .then( resp => {
      let coments = [];
      let i=0;
      if(resp[0].code===200){
        for(i=1; i<resp.length;i++){
          coments.push(resp[i])
        }
        for(i=0;i<coments.length;i++){
            let find="";
            find += `<strong>Usuari: </strong> ${coments[i].user}<br>`
            find += `<strong>Data: </strong>${strDate(coments[i].date)}<br>`;
            find += `<strong>Text: </strong><br><div class="p-4 border border-secondary bg-light rounded" > ${coments[i].text}</div>`
            if(coments[i].user==userN && (new Date()- new Date(coments[i].date)< 600000) ){
              find += `<button type="button" id="${coments[i]._id}" class="delcoment btn btn-warning">Eliminar</button>`
            }
            $(`#incident_${id}`).append(`<div id="coment_${coments[i]._id}" class="p-2 coment bg-light"> ${find} </div>`).show('slow')
          }   
      } else {
        $('#bar>.message').html(resp.message);
        return;
      }
      
    })

    .catch(error => {$('#bar>.message').html("Connection error: " + error.code);});
  };

  const incidentView = function(id,name) {
    
    if(parkId) $(`#${parkId}`).removeClass("sticky-top");
    $(`#${id}`).addClass("sticky-top");
    checker[id]['danger']=0;
    checker[id]['warn']=0;
    incident = undefined;
    parkId = id;
    parkN = name;
    if($(`#${id}`).attr('class').includes('bg-danger')) $(`#${id}`).removeClass("bg-danger");
    if($(`#${id}`).attr('class').includes('bg-warning')) $(`#${id}`).removeClass("bg-warning");
    $(`#${id}`).addClass(`${checker[id]['color']}`);
    let list= `${pending=="true"?',true':',false'}`
    $.ajax({
      contentType:  'application/json',
      method:       "GET",
      headers:{"access-token": `${token}`},
      url:url + '/incidents/'+id+list+","+filter+","+limit ,
    })
    .then(resp => {
      let incidents = [];
      if(resp[0].code===200){
        for(let i=1; i<resp.length;i++){
          incidents.push(resp[i])
        }

        $('#incidents').html(
          `<div id="bar_${id}" class="barinc text-center p-4 sticky-top bg-dark text-white ">\
            <h2>${name}</h2>\
            <p>
              <button type="button" id="${id}" class="nincident btn btn-outline-danger btn-sm">Nova incidencia</button>\
              <button type="button" id="${id}" class="pending btn btn-outline-warning btn-sm" >${pending==="true"?"Totes":"Pendents"}</button>\
            </p>
            <p>
              <input type="search" name="sbar" ${filter===""?` placeholder="Buscar títol incidència" `: ` value="${filter}" ` } id="sbar_${id}" class="sbar col-xs-1"/>\
              max:<input type="number" style="width:60px;" name="quantity" class="quant col-xs-2" value="${limit}" size="3" min="0" max="500">\
            </p>\
          </div>`
        )
        
      for(let i=0;i<incidents.length;i++){
        let color = i%2===0?"bg-secondary text-white":" bg-dark text-white" 
        let close=incidents[i].done==="false"?
          `<button type="button" id="${incidents[i]._id}"class="switch btn btn-outline-warning btn-sm">Tancar</button><br>`
          :`<button type="button" id="${incidents[i]._id}"class="switch btn btn-outline-warning btn-sm delete">Obrir</button><br>`
        let r = `<strong>Titol: ${incidents[i].title}</strong><br>`;
        r = r + `<strong>Usuari: </strong>${incidents[i].usr}<br>`
        r = r + `<strong>Data: </strong>${strDate(incidents[i].fdate)}<br>`;
        r = r + `<strong>Estat: </strong>${incidents[i].done==="false"?"Oberta":"Tancada"}<br>`
        r = r + `<strong>Actualitzat: </strong>${strDate(incidents[i].ldate)}<br>`;
        r = r + close;
        r = r + `<strong>Text:<br> </strong><div class="p-4 border border-secondary bg-light rounded text-dark" >${incidents[i].text}</div>`
        r = r + `<div id="coments_${incidents[i]._id}" class="coments"></div>`
        $('#incidents').append(`<div id="incident_${incidents[i]._id}" class="incident_box"><div id="${incidents[i]._id}" class="incident p-4 ${color} border border-dark "> ${r}</div></div>`).show('slow')
      }
      } else {
        $('#bar>.message').html(resp.message);
        return;
      }
      if(pending!='true' && limit===0 && filter==="") checker[id]['new']=incidents.length;
      //window.location.hash = '#bar';
      $('html, body').animate( { scrollTop : 0 }, 800 );
    })
    .catch(error => {$('#bar>.message').html("Connection error: " + error.code);});
    
  };


  // CONTROLLER

  const loginController = function() {
    userN = $('#bar>input.username').val();
    let password = $('#bar>input.password').val();
    limit = 0;
    if ( userN === "" || password === "") {
      $('#bar>.message').html("Falta usuari o password");
      return;
    }
    $.ajax({
      contentType:  'application/json',
      method:       "POST",
      data:         `{"password" : "${password}"}`,
      url:          url + '/login/' + userN,
    })
    .then(resp => {
      if(resp.code!==200){
        $('#bar>.message').html(resp.message);
        return
      }
      else {
        if(Cookie.get(userN)) checker=JSON.parse(Cookie.get(userN));
        else checker={};
        token = resp.token;
        userId = resp._id;
        filter="";
        loginView();
        parkingsView();
        interId = setInterval(watcher, 10000);
      }
      
    })
  };

    const countController = function(e) {
    for(elem in checker){
      let elemid=JSON.stringify(elem).replace(/\"/g,"")
      $.ajax({
        contentType:  'application/json',
        method:       "GET",
        headers:{"access-token": `${token}`},
        url:          url + '/countinc/'+elemid,
    }).then( r => {
      checker[elemid]['old']=checker[elemid]['new']
      checker[elemid]['new']=r;
    })
    .catch(error => {$('#bar>.message').html("Connection error: " + error.message);});
    }
  };

  const countComentController = function() {
    for(elem in checker){
      let elemid=JSON.stringify(elem).replace(/\"/g,"")
      $.ajax({
        contentType:  'application/json',
        method:       "GET",
        headers:{"access-token":`${token}`},
        url:          url + '/update/'+elemid,
    })
    .then( r => {
      checker[elemid]['oldc']=checker[elemid]['newc'];
      checker[elemid]['newc']=r;      
    })
    .catch(error => {$('#bar>.message').html("Connection error: " + error.code);});
    }
  };

  const newComentController = function(e) {
    let text= $(`#text_${e.currentTarget.id.split("_")[1]}`).val();
    if(text===""){
      alert("No pots crear un comentari buit");
      return
    }
    text=JSON.stringify(text)
    
    $.ajax({
      contentType:  'application/json',
      method:       "PUT",
      headers:{"access-token": `${token}`},
      data:         `{"incident":"${incident}","user":"${userN}","text":${text}}`,
      url:          url + '/newcoment/',
    }).then( r => { 
      checker[parkId]['newc']= new Date();
      checker[parkId]['oldc']= new Date();
      incidentView(parkId,parkN)
      comentsView(incident)

    })
    .catch(error => {alert("Error en la creació")});

  };

  const newIncidentController = function(e) {
    let text = $(`#text_${e.currentTarget.id.split("_")[1]}`).val();
    let done = $(`input[id=check_${e.currentTarget.id.split("_")[1]}]:checked`).val()==="on"?true:false;
    let title= $(`#title_${e.currentTarget.id.split("_")[1]}`).val();
    if(text==="" || title===""){
      alert("No pots deixar camps buits");
      return
    } 
    $.ajax({
      contentType:  'application/json',
      method:       "PUT",
      headers:{"access-token": `${token}`},
      data:         `{"park":"${parkId}","usr":"${userN}","title":"${title}","done":"${done}","text":${JSON.stringify(text)}}`,
      url:          url + `/incidents/`,
    })
    .then( r => { 
      checker[parkId]['new']+=1;
      checker[parkId]['old']+=1;
      checker[parkId]['newc']=new Date();
      checker[parkId]['oldcc']=new Date();
      incidentView(parkId, parkN)
    })
    .catch(error => {alert("Error en la creació")});
  };

    const switchController = function(id) {
      if(confirm("¿Segur que vols canviar l'estat?")){
          $.ajax({
          contentType:  'application/json',
          method:       "GET",
          headers:{"access-token": `${token}`},
          url:url + `/getincident/${id}`,
        })
        .then( r => { 
          if(r.code===200){
            checker[parkId]['newc']= new Date();
            checker[parkId]['oldc']= new Date();
            incidentView(parkId,parkN);
          }
        })
        .catch(error => {alert("Error de connexió, no s'ha canviat")});

      };
    };
     

      const delComentController = function(id) {

    $.ajax({
      contentType:  'application/json',
      method:       "DELETE",
      headers:{"access-token": `${token}`},
      url:          url + `/delcoment/${id}`,
    })
    .then( r => { 
      if(r.code===200){
        comentsView(incident);
      }
      else alert("Error de connexió, no s'ha eliminat")
    })
    .catch(error => {alert("Error de connexió, no s'ha eliminat")});

  };

  const pendingController = function(id) {
    if(pending===undefined || pending === "false") pending="true";
    else pending = "false";
    incidentView(id, parkN);
  };

  const logoutController = function() {

    clearInterval(interId)
    if(checker!=={}) Cookie.set(userN, JSON.stringify(checker), 40)
    token =  undefined;
    parkId = undefined;
    parkN =  undefined;
    find = undefined;
    filter = undefined;
    limit = undefined;
    checker = undefined;

    logoutView();
  };

    const newUserController = function() {

    var suser = document.getElementById("suser").value.toLowerCase();
    var spass = document.getElementById("spass").value;
    var nuser = document.getElementById("nuser").value;
    var npass = document.getElementById("npass").value;

    if(suser===""||spass===""||nuser===""||npass===""){
      alert("Has d'omplir tots els camps")
      return
    }

    $.ajax({
      contentType:  'application/json',
      method:       "PUT",
      data:         `{"suser":"${suser}", "spass":"${spass}", "nuser":"${nuser}", "npass":"${npass}" }`,
      url:          url + '/newuser/',
    }).then( r => { 
      alert(`${r.message}`)
      $('.newUser').hide('slow').remove()

    })
    .catch(error => {$('#bar>.message').html("Connection error: " + error.code);});
  };

  const filterController = function(val) {

    filter = val;
    incidentView(parkId, parkN);

  };

  const quantController = function(val) {
    limit = val;
    incidentView(parkId, parkN);


  };
  // ROUTER

  const eventsController = function() {
    $(document).on('keypress', '#bar>input.password', (e) => {if (e.keyCode === 13) loginController(false);});
    $(document).on('click', '#bar>.login', ()=> loginController(false));
    $(document).on('click', '#bar>.logout',()=> logoutController());
    $(document).on('click', '.park',  (e) => incidentView(e.currentTarget.id,$(e.target).attr('name')));
    $(document).on('click', '.incident',  (e) => {if(e.currentTarget.id!==incident && !e.originalEvent.explicitOriginalTarget.className.includes("delete"))comentsView(e.currentTarget.id)});
    $(document).on('click', '.ncoment',  (e) => newComentView(e));
    $(document).on('click', '.newComent',  (e) => newComentController(e));
    $(document).on('click', '.cancelCom',  (e) => backComentView(e.currentTarget.id.split("_")[1]));
    $(document).on('click', '.nincident',  (e) => newIncidentView(e));
    $(document).on('click', '.newIncident',  (e) => newIncidentController(e));
    $(document).on('click', '.cancelInc',  (e) => backIncidentView(e.currentTarget.id.split("_")[1]));
    $(document).on('click', '.switch',  (e) => switchController(e.currentTarget.id));
    $(document).on('click', '.delcoment',  (e) => delComentController(e.currentTarget.id));
    $(document).on('click', '.pending',  (e) => pendingController(e.currentTarget.id));
    $(document).on('click', '.create',  () => newUserView());
    $(document).on('click', '.nuser',  () => newUserController());
    $(document).on('change', '.sbar', (e) => filterController($('.sbar').val()));
    $(document).on('change', '.quant', (e) => quantController($('.quant').val()));
    $(document).on('click', '.coment',  (e) => {if(!e.originalEvent.explicitOriginalTarget.className.includes("btn")) removeComentView()});
  };

  let interId, parkId, parkN, filter, limit, userId, userN, pending, cinc, ccom, checker={};
  eventsController();
  logoutController();
});
