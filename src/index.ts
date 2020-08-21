import express, { Application, Request, Response, NextFunction } from "express"
import jwt from'jsonwebtoken';
import { User } from "./interface/user";
import auth from './api/authenticate'
import * as country from './api/countries'

const app:Application = express();
const PORT:number = 3000;
const secretkey:string = 'secretkey' ;

app.use(express.json())
app.use((req:Request, res:Response, next:NextFunction)=>{
      if(req.path === '/generate/token') {
          next();
      } else {
          const authorizationheader:string =  req.headers['authorization']|| '';
          const token:string = authorizationheader && authorizationheader.split(' ')[1];
          jwt.verify(token,secretkey,(err:any, user:any)=>{
             if(err) return res.sendStatus(401);
             auth(user.userName,user.password)
             .then(resp=>{
                 if(resp) {
                     next();
                 }else {
                     return res.sendStatus(403);
                 }
             }).catch (e=>{
                 res.json(e)
             })
          })
      }
})
app.get('/generate/list', country.populateList);
app.get('/list/country/:sort', country.sortList)

app.get('/country/:id', country.getByid)
app.put('/country/:id', country.updateByid)
app.delete('/country/:id', country.deleteByid)

app.post('/generate/token', (req:Request, res:Response)=>{
    if(!req.body.username || ! req.body.password){
      return  res.json({message:'Required username and password'})
    }
    const user:User ={
           userName:req.body.username,
           password:req.body.password
    }
    const token = jwt.sign(user, secretkey)
    res.json({token});
})


app.listen(PORT, ()=>{console.log(`Running at port: ${PORT}`)})