const dotenv=require('dotenv')
dotenv.config()

const http=require("http")
const express=require("express")
const cookieParser=require('cookie-parser')
const authRoutes=require('./routes/auth.routes')
const productRoutes=require('./routes/product.routes')
const cartRoutes=require('./routes/cart.routes')
const paymentRoute=require('./routes/payment.routes')
const couponRoutes=require('./routes/coupon.routes')
const analyticsRoutes=require('./routes/analytics.routes')
const fileUpload=require('express-fileupload')
const path=require('path')
const cors=require('cors')
const ConnectToDb=require('./db')
const app=express()
const server=http.createServer(app)
ConnectToDb()

app.use(express.json({limit:"50mb"})); 
app.use(express.urlencoded({extended:true,limit:"50mb"}));

app.use(cookieParser())

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true, 
}));

app.use(fileUpload({
    useTempFiles: true,
    tempFiledir: path.join(process.cwd(), 'temp'),
    createParentPath: true,
    limits: { fileSize:50*1024*1024}
}));


app.get("/",(req,res)=>{
    res.send("<h1>hello World</h1>")
})


app.use('/api/auth',authRoutes)
app.use('/api/products',productRoutes)
app.use('/api/cart',cartRoutes)
app.use('/api/coupons',couponRoutes)
app.use('/api/payments',paymentRoute)
app.use('/api/analytics',analyticsRoutes)

server.listen(process.env.PORT || 3000,()=>{
    console.log(`Server is listening on the port ${process.env.PORT}`)
})