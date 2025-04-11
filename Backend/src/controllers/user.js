import {User} from  "./../models/user.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config({
    path:"../../.env" //give .env file location
});

const signUp = async(req,res)=>{
    try{
        const
        {
            username,
            fullname,
            password,
            email,
            avatar,
            lifelineCount,
            lastModifiedReset
        }=req.body;

        const existingUser=await User.findOne({username});
        if(existingUser){
            return res.status(400).json({
                success: false,
                message: "this user already exists. (same username found)",
            })
        }

        const hashedPassword=await bcrypt.hash(password,10);

        const user=await User.create({
            username,
            fullname,
            password: hashedPassword,
            email,
            avatar,
            lifelineCount,
            lastModifiedReset
        });

        return res.status(200).json({
            success:true,
            user,
            message:"user created successfully.",
        });

        console.log("user->register controller completed executed");
        
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"user cannot be registered",
        });
    }
};

const signIn= async (req,res)=>{
    try{
        
        const{email, password}=req.body;

        if(!email || !password){
            return res.status(400).json({
                success:"false",
                message:"fill all the required fields",
            });
        }

        const user= await User.findOne({email});

        console.log(user);

        if(!user){
            return res.status(401).json({
                success:false,
                message:"user not found, please register",
            });
        }

        if(await bcrypt.compare(password, user.password)){

            const token=jwt.sign({
                email:user.email,
                id:user._id,
                username:user.username,
            },
            process.env.JWT_SECRET || "secret", //USE ENV HERE
            {
                expiresIn: "24h",
            }
            );

            const options={
                expires: new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true,
            };

            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"user login success"
            })

            console.log("-------");

        }else{
            return res.status(401).json({
                success:false,
                message:'password not matched',
            })
        }

        console.log("user->login controller executed");

    }catch(error){
        return res.status(401).json({
            success:false,
            message:"user login failed"
        })
    }
}

export {
    signUp,
    signIn
}