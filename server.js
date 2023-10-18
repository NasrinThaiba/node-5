const express = require("express");

const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const Mentor = require('./model/Mentor');
const Student = require('./model/Student');

const app = express();

const PORT = 4000;

app.use(bodyParser.json());

const DB_URL = "mongodb+srv://Nasrin:Nasrin22@cluster0.28tvpch.mongodb.net/?retryWrites=true&w=majority";

mongoose
.connect(DB_URL, {})
.then(()=>console.log("MongoDB connected successfully"))
.catch((err)=> console.log("Unable to connect", err))

app.post("/mentor", async(req,res)=>{
    try{
        const mentor = new Mentor(req.body);
        await mentor.save();
        res.status(202).send(mentor);
    }
    catch(error){
        res.status(400).send(error.message);
    }
})

app.post("/student", async(req,res)=>{
    try{
        const student = new Student(req.body);
        await student.save();
        res.status(202).send(student);
    }
    catch(error){
        res.status(400).send(error.message);
    }
})

app.post("/mentor/:mentorId/assign", async(req,res)=>{
    try{
        const mentor = await Mentor.findById(req.params.mentorId);
        const students = await Student.find({_id: {$in: req.body.students}});

    students.forEach((student) => {
        student.cMentor = mentor._id;
        student.save();
    });

    mentor.students = [
        ...mentor.students, 
        ...students.map((student) => student.id)]
    
        await mentor.save();
        res.send(mentor);
    }
    catch(error){
        res.status(400).send(error.message);
    }
})

app.put("/student/:studentId/assignMentor/:mentorId", async(req,res)=>{
    try{
        const mentor = await Mentor.findById(req.params.mentorId);
        const student = await Student.findById(req.params.studentId);

        if(student.cMentor) {
            student.pMentor.push(student.cMentor);
        }

        student.cMentor = mentor._id;
        await student.save();
        res.send(student);
    }
    catch(error){
        res.status(400).send(error.message);
    }
})

app.get("/mentor/:mentorId/students", async(req,res)=>{
    try{
        const mentor = await Mentor.findById(req.params.mentorId).populate("students");
        res.send(mentor)
    }
    catch(error){
        res.status(400).send(error.message);
    }
})

app.get("/student/:studentId/pMentor", async(req,res)=>{
    try{
        const student = await Student.findById(req.params.studentId).populate("pMentor");
        res.send(student)
    }
    catch(error){
        res.status(400).send(error.message);
    }
})

app.listen(PORT, ()=>{
    console.log("server is running in port", PORT)
})