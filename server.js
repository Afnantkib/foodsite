const express = require("express");
const jwt=require("jsonwebtoken");
const secrets=require("./sercets");
const app = express();
const userModel = require("./userModel");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(express.urlencoded());
app.use(express.json());
app.set('view engine','ejs');
app.set('views','./views');
app.use(express.static('assets'));
//we will use JWT web tokken
//home work create user , delete user etc etc 
app.get('/signup-page',(req,res)=>{
    res.render('signup');
})
app.get('/signin-page',(req,res)=>{
    res.render('signin');
})
app.get('/contactus',(req,res)=>{
    res.render('contactus');
})
app.get('/signout',(req,res)=>{
    res.clearCookie('JWT');
    res.redirect("signin-page");
})
app.post('/signup', (req, res) => {
    let data = req.body;
    console.log(data);
    userModel.create((data), (err, newUser) => {
        console.log("hello11111");
    });
    res.redirect('signin-page');
})
app.post('/submit-feedback',async (req,res)=>{
    //save to db
    let{email,feedback}=req.body;
    console.log("hererrererereerrerere")
    console.log(feedback)
    userModel.findOneAndUpdate({email:email},{feedback:feedback},(err,user)=>{
        if(err){
            console.log("Line 39",err);
            return;
        }
    })



    //show success
    res.send("Feedback sent successfully");
})

app.post('/login', (req, res) => {
    let { email, password } = req.body;
    console.log(email + " " + password);
    if (email && password) {
        userModel.findOne({ email: email }, (err, user) => {
            if (err) {
                return res.end("Invalid email");

            }
            if (user) {
                if (user.password == password) {
                    console.log(user+'');
                    const token = jwt.sign({
                        data: user["_id"],
                        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
                    }, secrets.JWTSECRET);
                    // put token into cookies
                    res.cookie("JWT", token);
                    res.render("profile",{userModel:user});

                }else{
                     res.end("Password entered is wrong ");
                }
            }
        })
    } else {

        return res.end("Kindly enter email and password both");
    }




})




app.patch('/forgetpassword', async (req,res)=>{
  try{
    let {email}=req.body;
    let otp=otpgenerator();
    let user=await userModel.findOneAndUpdate({email},{otp:otp},{new:true});
    console.log(user);
    res.send(
        {
            data:user,
            message:"Otp sent to your mail"
        }
    )

  }
  catch(err){
    res.end(err);
  }

     
})

app.patch("/resetpassword", async (req,res)=>{
    try{
        let {otp , password , confirmPassword } = req.body;
        //validators in model run only after putting runValidator:true
        let user=userModel.findOneAndUpdate({otp},{password,confirmPassword,otp:undefined},{runValidators:true},{new:true});
        res.json({
            data:user,
            message:"Password for the user is reset"
        })

    }
    catch(err){
        res.end(err.message);
    }
})

//get all users
//protectRoute is a middleware which will be responsible for some checks from the request itself
//we can append N number of middlewares with next()
app.get("/users", protectRoute, (req, res) => {
    userModel.find({}, (err, users) => {
        if (err) {
            res.end("Error in accessing users");
        }
        res.end(JSON.stringify(users));
    })
});







app.get("/user", protectRoute, async function (req, res) {
    // user profile ka data show 
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId);
        res.json({
            data: user,
            message: "Data about logged in user is send"
        });
        // model by Id -> get
        // res-> send 
    } catch (err) {
        console.log("Reached here");
        res.end(err.message);

    }

})









function protectRoute(req, res, next) {
    try {
        const cookies = req.cookies;
        const JWT = cookies.JWT;
        if (cookies.JWT) {
            console.log("protect Route Encountered");
            // you are logged In then it will 
            // allow next fn to run
            let token = jwt.verify(JWT, secrets.JWTSECRET);
            console.log("Jwt decrypted", token);
            let userId = token.data
            console.log("userId",userId);
            req.userId = userId;

            next();
        } else {
            res.send("You are not logged In Kindly Login");
        }
    } catch (err) {
        console.log(err);
        if (err.message == "invalid signature") {
            res.send("Token invalid kindly login");
        } else {

            res.send(err.message);
        }
    }

}
function otpgenerator(){
    return Math.floor(100000+Math.random()* 900000);

}


app.listen(3000, (err) => {
    if (err) {
        console.log("Error");
        return;
    }
    console.log("Running Successfully");
})


