var express=require('express');
var cookiParser=require('cookie-parser');
var session=require('express-session');
var fs=require('fs');
var multer=require('multer');


var app=express();

app.set("view engine","pug");
app.set("views","./views");

app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.use(express.static(__dirname+"/public"));
app.use(express.static(__dirname+"/uploads"))

app.use(cookiParser());
app.use(session({secret:"it is my secret key"}));

app.get("/",function(req,res)
{
    res.redirect("/login.html")
})
//register
app.post("/registerpage",function(req,res)
{
    var all=fs.readFileSync("database.json");
    all=JSON.parse(all);
    var obj={}
    obj.username=req.body.username;
    obj.password=req.body.password;
    all.users.push(obj);
    fs.writeFileSync("database.json",JSON.stringify(all),'utf-8');
    res.redirect("/login.html");
})
//checking login credentials
app.post("/loginpage",function(req,res){
    var all=fs.readFileSync("database.json");
    all=JSON.parse(all);
    var allusers=all.users;
    var temp=0;
    allusers.forEach(function(a,b)
    {
        if(a.username==req.body.username && a.password==req.body.password)
        {
            temp=1;
        }
    })
    if(temp==1)
    {
        req.session.user=req.body;
        res.cookie('username',req.body.username);
        res.redirect("/home");
    }
    else{
        res.redirect("/register.html")
    }
})
app.use(function(req,res,next)
{
    if(req.cookies.username)
    {
        next();
    }
    else{
        res.redirect("/login.html");
    }
})
app.get("/home",function(req,res)
{
        var alldata=fs.readFileSync("database.json");
        alldata=JSON.parse(alldata)
        var uniquelocations=[];
        alldata.fooddetails.forEach(function(a,b)
        {
            if(uniquelocations.includes(a.location))
            {

            }
            else{
                uniquelocations.push(a.location);
            }
        })
        //console.log(alldata.fooddetails[0].filenames[0]);
        var n=uniquelocations.length;
        //console.log(selected);
        //res.render("selectedfood",{ad:alldata.fooddetails,sf:selected})
        res.render("home",{allfood:alldata.fooddetails,fd:uniquelocations,u:req.session.user.username,sf:'all',n:n,u:req.cookies.username});
})
app.post("/gettingfood",function(req,res){
    var alldata=fs.readFileSync("database.json");
    alldata=JSON.parse(alldata);
    var selected=req.body.selectedoption;
    //console.log(selected);
    //res.redirect("/home");
    var uniquelocations=[];
    alldata.fooddetails.forEach(function(a,b)
        {
            if(uniquelocations.includes(a.location))
            {

            }
            else{
                uniquelocations.push(a.location);
            }
        })
    res.render("home",{allfood:alldata.fooddetails,fd:uniquelocations,u:req.session.user.username,sf:selected});
})
    //res.render("selectedfood",{ad:alldata.fooddetails,sf:selected})
//adding items
app.get("/additem",function(req,res)
{
    res.render("addfoodform");
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'D:/WAL_Training/FoodApplicationAssignmentHeroku/FoodApp/uploads')}
    })

var abc=multer({storage:storage})
var l;
app.post("/addingfood",abc.array('foodimage'),function(req,res)
{
    var all=fs.readFileSync("database.json");
    all=JSON.parse(all);
    var allfiles=req.files;
    var allimages=[];
    allfiles.forEach(function(a,b)
    {
        allimages[b]=a.filename;
    })
    console.log(allimages);
    //console.log(allfiles.filename);
    var obj={};
    l=all.fooddetails.length;
    obj.foodname=req.body.foodname;
    obj.capacity=req.body.capacity;
    obj.price=req.body.price;
    obj.remarks=req.body.remarks;
    obj.location=req.body.location;
    obj.delivery=req.body.delivery;
    obj.filenames=allimages;
    obj.username=req.session.user.username;
    obj.id=l+1;
    all.fooddetails.push(obj);
    fs.writeFileSync("database.json",JSON.stringify(all),'utf-8');
    res.redirect("/home");
})
app.get("/getfooddetails/:key",function(req,res)
{
    var all=fs.readFileSync("database.json");
    all=JSON.parse(all);
    res.render("fooditemdetails",{fd:all.fooddetails,id:req.params.key});
})
app.get("/placedorders/:key",function(req,res)
{
    var all=fs.readFileSync("database.json");
    all=JSON.parse(all);
    var obj={};
    obj.whatorderedid=req.params.key;
    obj.whoorderd=req.session.user.username;
    all.orders.push(obj);
    fs.writeFileSync("database.json",JSON.stringify(all),'utf-8');
    res.redirect("/home");
})
app.get("/placedorder",function(req,res){
    var all=fs.readFileSync("database.json");
    all=JSON.parse(all);
    res.render("placedorders",{od:all.orders,me:req.session.user.username,food:all.fooddetails});
})
app.get("/receivedorders",function(req,res){
    var all=fs.readFileSync("database.json");
    all=JSON.parse(all);
    res.render("receivedorders",{od:all.orders,me:req.session.user.username,food:all.fooddetails});
})
app.get('/logout',function(req,res)
{
    res.clearCookie('username');
    req.session.destroy((err) => {
        res.redirect('/login.html')
      })
})
app.get("/back",function(req,res)
{
    res.redirect("/home");
})
app.get("/myfooditems",function(req,res)
{
    var all=fs.readFileSync("database.json");
    all=JSON.parse(all);
    res.render("myfooditems",{me:req.session.user.username,food:all.fooddetails});
})
app.get("/delete/:key",function(req,res)
{
    var all=fs.readFileSync("database.json");
    all=JSON.parse(all);
    var i=req.params.key;
    allfood=all.fooddetails;
    allfood.forEach(function(a,b)
    {
        if(a.id==i)
        {
            allfood.splice(b,1);
        }
    })
    all.fooddetails=allfood;
    fs.writeFileSync("database.json",JSON.stringify(all),'utf-8');
    res.redirect("/myfooditems");
})

app.get("/data",function(req,res)
{
    var all=fs.readFileSync("database.json");
    all=JSON.parse(all);
    allfood=all.fooddetails;
    res.send(allfood);
})
app.get("/deleteplacedorder/:key",function(req,res)
{
    var all=fs.readFileSync("database.json");
    all=JSON.parse(all);
    var i=req.params.key;
    allorders=all.orders;
    allorders.forEach(function(a,b)
    {
        if(a.whatorderedid==i)
        {
            allorders.splice(b,1);
        }
    })
    all.orders=allorders;
    console.log(allorders);
    fs.writeFileSync("database.json",JSON.stringify(all),'utf-8');
    res.redirect("/placedorder");

})
app.get("/edititem/:key",function(req,res)
{


})
app.listen(process.env.PORT);