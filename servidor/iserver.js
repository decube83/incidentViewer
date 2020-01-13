const 	express = 		require('express'),
		http = 			require('http'),
		bodyParser = 	require('body-parser'),
		jwt = 			require('jsonwebtoken'),
		client = 		require('mongodb').MongoClient,
		app = 			express(),
		cors = 			require('cors');

		ssKey = 		"hell0W0rld"
		PORT = 			8001,
		mongoPort=		27017,
		mongoURL =		`mongodb://localhost:${mongoPort}`;

app.use(bodyParser.json());
app.use(cors());

const protected = express.Router();
protected.use((req, res, next) => {
    const token = req.headers['access-token'];

    if (token) {
        jwt.verify(token, ssKey, (err, decoded) => {
            if (err) {
                return res.json({
                    code: 401,
                    message: 'Invalid token' });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        res.send({
            code:401,
            message: 'Empty token'
        });
    }
});


const loginController = (req, res) => {

	client.connect(mongoURL, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then( db => {
    	let query=new Object()
        query = {"user":`${req.params.user}`},{ $exists : true }
        db.db('pmud').collection('users').find( query ).toArray(function(err, result) {
            if (err) throw err;
            db.close();
            if(typeof result == 'undefined' || result.length == 0){
            	res.json({"code":404,"message":"Usuari no trobat"})
            	return
            }
            result=result[0];
            if(result.pass===req.body.password){
            	let token = jwt.sign({user: result.user, _id : result._id}, ssKey )
		  		res.json({code: 200,token: token});
		    } else {
		        res.json({
		            code: 401,
		            message: "Revisar contrassenya"
		        })
		    }
		})
    })
    .catch( err => {
    	console.log(err);
        res.json({code:500, "message": err});
        return;
    })
};

const getIncidentController = (req, res) => {

	client.connect(mongoURL, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then( db => {
    	var mongo = require('mongodb');
    	let oid = new mongo.ObjectID(req.params.id)

        db.db('pmud').collection('incidents').find( {'_id': oid} ).toArray(function(err, result) {
            if (err){
            	res.send({code:500, "message": err})
            } 
            if(result[0]){
            	if(result[0].done==="true") result[0].done="false"
            	else result[0].done="true"
            	result[0].ldate=new Date();
            	db.db('pmud').collection('incidents').updateOne({'_id':result[0]._id},{ $set: {ldate: new Date(), "done":result[0].done} }, function(err, result) {
            	if (err) throw err;
            	db.close();
            	res.send({"code":200})

    	})
            }else{
				throw err="404 Not found";
            }

		})
    })
    .catch( err => {
    	console.log(err);
        res.json({code:500, "message": err});
        return;
    })
};

const parkingsController = (req, res) => {
	let token = req.headers['access-token'];
	client.connect(mongoURL, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then( db => {

        db.db('pmud').collection('parkings').find( {} ).toArray(function(err, result) {
            if (err) throw err;
            db.close();
            //result= JSON.stringify(result).split('"')[3]
            result.unshift({code:200})
            res.send(result)
		})
    })
    .catch( err => {
    	console.log(err);
        res.json({code:500, "message": err});
        return;
    })
};

const incidentsController = (req, res) => {

	let token = req.headers['access-token'];
	client.connect(mongoURL, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then( db => {
    	let id= req.params.id.split(",")[0]
    	let type=req.params.id.split(",")[1]
    	let search=req.params.id.split(",")[2];
    	let limit=parseInt(req.params.id.split(",")[3]);
    	let query={}
    	if(search=="" || search==undefined){
    		if(type=="true"){
    			query = {park: id, "done": "false" }
    		}else{

    			query = {park: id }	
    		}
    		
    	}else{
    		if(type=="true"){
    			query = {park: id, "done": "false", "title" : {$regex : ".*"+search+".*", $options:`i`}}
    		}else{
    			query ={park: id, "title" : {$regex : ".*"+search+".*", $options:`i`}}
    		}
    			
    	} //search=`*${req.params.id.split(",")[2]}*`;
    	//else search=""
        db.db('pmud').collection('incidents').find( query).limit(limit).sort({ldate:-1}).toArray(function(err, result) {
            if (err){
            	console.log(err)
        		res.send({code:500, "message": err})
            } 
            db.close();
            result.unshift({code:200})
            res.send(result)
		})
    })
    .catch( err => {
    	console.log(err);
        res.json({code:500, "message": err});
        return;
    })
};


const newIncidentController = (req, res) => {
	client.connect(mongoURL, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then( db => {
    	req.body.fdate=new Date();
    	req.body.ldate=new Date();

        db.db('pmud').collection('incidents').insertOne( req.body , function(err, result) {
            if (err) throw err;
            db.close();
            res.json({code:200, message:result})  
		});
    })
    .catch( err => {
    	console.log(err);
        res.json({code:500, "message": err});
        return;
    })
};


const comentsController = (req, res) => {

	let token = req.headers['access-token'];
	client.connect(mongoURL, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then( db => {
    	let aux= new Object;
    	aux.incident=req.params.id;
        db.db('pmud').collection('coments').find( aux ).sort({date:-1}).toArray(function(err, result) {
            if (err) throw err;
            db.close();
            //result= JSON.stringify(result).split('"')[3]
            result.unshift({code:200})
            res.send(result)
		})
    })
    .catch( err => {
    	console.log(err);
        res.json({code:500, "message": err});
        return;
    })
};

const logController = (req, res, next) => {
    console.log("******************************************");
    console.log('req.method = ' + req.method);
    console.log('req.URL = ' + req.originalUrl);
    console.log('req.body = ' + JSON.stringify(req.body));
    console.log("******************************************");
    next();
  };


 const newComentController = (req, res) => {
    client.connect(mongoURL, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then( db => {
	    req.body.date=new Date()
        db.db('pmud').collection('coments').insertOne(req.body, function(err, result) {
            if (err) throw err;
            db.close();
            
		});
    })
    .catch( err => {
    	console.log(err);
        res.json({code:500, "message": err});
        return;
    })

    client.connect(mongoURL, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then( dba => {
    	var mongo = require('mongodb');
    	let oid = new mongo.ObjectID(req.body.incident)
        dba.db('pmud').collection('incidents').updateOne({'_id':oid},{ $set: {ldate: new Date()} }, function(err, result) {
            if (err) throw err;
            dba.close();
            res.send({"code":200})

    	})
    })
    .catch( err => {
    	console.log(err);
        res.json({code:500, "message": err});
        return;
    })
  };

  const delComentController = (req, res) => {
	client.connect(mongoURL, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then( db => {
    	var mongo = require('mongodb');
    	oid= new mongo.ObjectID(req.params.id)
        db.db('pmud').collection('coments').deleteOne( {'_id':oid} , function(err, result) {
            if (err){
            	console.log(err);
       			res.json({code:500, "message": err});
        		return;
            }
            db.close();
            res.json({code:200, message:result})  
		});
    })
    .catch( err => {
    	console.log(err);
        res.json({code:500, "message": err});
        return;
    })
};

  const newUserController = (req, res) => {
  	if(req.body.suser!="root"&&req.body.spass!="toor"){
  		res.send({"code":401, "message":"No autoritzat"});
  		return
  	} 
	client.connect(mongoURL, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then( db => {
    	let query=new Object()
        query = {"user":`${req.body.nuser}`},{ $exists : true }
        db.db('pmud').collection('users').find( query ).toArray(function(err, result) {
            if (err){
            	res.json({code:500, "message": err});
            	console.log(err);
        		return;
            } 
            if( result.length===1 ){
            	db.close();
            	res.json({"code":404,"message":"Usuari ja existeix"})
            	return 
            }else{
            	db.db('pmud').collection('users').insertOne({"user":req.body.nuser, "pass":req.body.npass}, function(err, result) {
		            if (err){
		            	res.send({"code":500,"message":err})
		            	db.close();
		            	return
		            }else{
		            	db.close();
		            	res.send({"code":201,"message":"Usuari creat"}) ;
		            	return;
		            }
		        }); 
		        
	        }    
	                       
		});

    });        
};


  const countIncidentController = (req, res) => {

	client.connect(mongoURL, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then( db => {

        db.db('pmud').collection('incidents').find( {'park':req.params.id} ).count(function (err, result) {
            if (err) {
            	console.log(err);
            	res.json({code:500, "message": err});
        		return;
            }
            res.json(result);
		});

    })
    .catch( err => {
    	console.log(err);
        res.json({code:500, "message": err});
        return;
    })        
};

  const updateController = (req, res) => {
  	let resp=0;
	client.connect(mongoURL, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then( db => {
        db.db('pmud').collection('incidents').find( {'park':req.params.id},{'fields':{"ldate":-1,"_id":0}} ).sort({"ldate":-1}).limit(1).toArray(function(err, result) {
            if (err){
            	console.log(err);
            	res.json({code:500, "message": err});
        		return;
            }
            if(result[0]!==undefined) res.send(result[0].ldate);
            else res.send(new Date(1000));
            
		});
    })
    .catch( err => {
    	console.log(err);
        res.json({code:500, "message": err});
        return;
    })        
};


app.use('*',                  	logController);
//app.get( '/',      				indexController);
app.post('/login/:user',		loginController);
app.put('/newuser/', 			newUserController);
app.use('*',					protected);
app.get('/parkings', 			parkingsController);
app.get('/incidents/:id/',		incidentsController);
app.get('/countinc/:id', 		countIncidentController);
app.get('/update/:id', 			updateController);
app.get('/getincident/:id', 	getIncidentController);
app.put('/incidents/', 			newIncidentController);
app.get('/coments/:id', 		comentsController);
app.put('/newcoment/', 			newComentController);
app.delete('/delcoment/:id',	delComentController);



http.createServer(app).listen(PORT, () => {
  console.log('Server started at http://localhost:'+ PORT);
});