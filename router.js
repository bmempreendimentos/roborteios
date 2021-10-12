const express = require('express')
const User = require('./models/User')
const router = express.Router()
const jwt = require('jsonwebtoken');
const secret = "SyyADcroRktkyGDZPjkKDoX299sPcMxI";
const botComment = require('./botComment')

// MIDDLEWARE
const auth = (req, res, next) =>{
    let token = req.headers["authorization"]
    if(token != undefined){
        let auth = token.split(" ")[1]
        jwt.verify(auth, secret, (err, data)=>{
            if(err){
                res.statusCode = 400
                res.json({"err": "invalid token"})
            }else{
                res.statusCode = 200
                req.authenticated = auth
                req.dataLog = {id: data.id, name: data.name, email: data.email}
                next()
            }
        })

    }else{
        res.statusCode = 404
        res.json({"err": "not found token"})
    }
 }

router.post('/bot', async(req,res)=>{
    const {user, pass, link, qtd, listUsersComment, phrase} = req.body
    await botComment(user, pass, link, qtd, listUsersComment, phrase)
    res.json({msg:"executed"})
})

router.post('/cadastro', async(req,res)=>{
    const {name, email, pass} = req.body
    try {
        if(name != undefined && email != undefined && pass != undefined){
            await User.create({
                name,
                email,
                pass
            })
            res.statusCode = 200
            res.json({msg: "success"})
        }else{
            res.statusCode = 400
            res.json({msg: "error param"})
        }
    } catch (error) {
        res.statusCode = 500
    }
})

router.post('/login', async(req,res)=>{
    const {email, pass} = req.body
    try {
        if(email != undefined && pass != undefined){
            const objResponse = await User.findOne({
                where: {
                    email,
                    pass
                }
            })
            if (objResponse != null){
                const {id, name, email, pass} = objResponse
                jwt.sign({"id": id, "name": name, "email": email}, secret, {expiresIn: "48h"},(err, token)=>{
                    if(err){
                        res.statusCode = 500
                        res.json({"err": "error internal"})
                    }else{
                        res.statusCode = 200
                        res.json({"token": token})
                    }
                })
            }else{
                res.statusCode = 404
                res.json({msg: "invalid credentialsa"})
            }
        }else{
            res.statusCode = 400
            res.json({msg: "error param"})
        }
    } catch (error) {
        res.statusCode = 500
    }
})


module.exports = router