//require mongoose
const mongoose=require("mongoose");
//connect to your mongo account // it is promise based
//database server ka link
const dblink="mongodb+srv://Afnantkib:KvyIeOnuHg2iv1gF@cluster0.cx8yq.mongodb.net/?retryWrites=true&w=majority"

//connecting to mongoDB atlas
mongoose
    .connect(dblink)
    .then(()=>{
        console.log("Connected to db");
    })
    .catch((err)=>{
        if(err){
            console.log(err," Error connecting to DB");
        }
    });
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name is required"],

    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phonenumber:{
        type:String,
        minLength:[10,"If length is <10 then this error will show up"],
        maxLength:10
    },
    feedback:{
        type:String
    }
    ,
    pic:{
        type:String,
        default:"dp.png"
    },
    password:{
        type:String,
        required:true
    },
   confirmPassword:{
        type:String,
        required:true,
        validate:{
            validator:function(){
                    return this.password==this.confirmPassword;
            },
            //error message
            message: "password mismatch"
        },
    },
    otp:{
        type:String
    },
    address:{
        type:String,

    }
});

//model is similar to collection in a DataBase
//userSchema is the Schema of the document that a document should follow
const UserModel=mongoose.model('UserModel',userSchema);
module.exports=UserModel;




