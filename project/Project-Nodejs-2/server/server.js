const express = require("express");
const app = express();
const mongoose = require("mongoose");
const paypal = require("paypal-rest-sdk");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users.js");
const authRoute = require("./routes/auth.js");
const productsRoute = require("./routes/products.js");
const inputFieldRoute = require("./routes/inputFieldConfigProduct.js");
const imgLogoFieldRoute = require("./routes/imageLogoField.js");
const selectFieldRoute = require("./routes/selectField.js");
const cartRoute = require("./routes/cart.js");
const commentRoute = require("./routes/comment.js");
const searchRoute = require("./routes/search.js");
const categoryRoute = require("./routes/category.js");
const userAddressRoute = require("./routes/userAddress.js");
const paymentRoute = require("./routes/payment.js");
const orderRoute = require("./routes/order.js");
const path = require("path");

const cors = require("cors");
const cookieParser = require("cookie-parser");

require("dotenv").config();
dotenv.config();

paypal.configure({
  mode: "sandbox",
  client_id:
    "AZU-WEDM-F1OZ0P4WasT4a-HzcvfmhwffXXukQJqKEd6LysONXMW-O8z7oTPKgGkg0zONh-mkA5YumFL",
  client_secret:
    "EBmpfnknSWl2MmTFoUPXJoUOoibPB7xM79-EKrBaga-SmTfloKmsoUJM36OW-zBARbipVNFS6rAPB_90",
});

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
  })
  .then(() => console.log("DB Connected"))
  .catch((err) => {
    console.error(
      "Failed to connect to the database on startup - retrying in 5 sec",
      err
    );
  });

//middleware

app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ["Content-Type", "x-auth-token"],
    methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
  })
);
app.use(helmet());
app.use(morgan("common"));
app.use(cookieParser());

//mail sender detail
app.use(function (req, res, next) {
  res.header("Content-Type", "application/json;charset=UTF-8");
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use("/api/auth", authRoute);
app.use("/api/input-field", inputFieldRoute);
app.use("/api/select-field", selectFieldRoute);
app.use("/api/logo-field", imgLogoFieldRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productsRoute);
app.use("/api/cart", cartRoute);
app.use("/api/comment", commentRoute);
app.use("/api/search", searchRoute);
app.use("/api/category", categoryRoute);
app.use("/api/user-address", userAddressRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/order", orderRoute);

__dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../web-ban-hang/build")));
  app.get("*", (req, res) => {
    res.sendFile(
      path.resolve(__dirname, "web-ban-hang", "build", "index.html")
    );
  });
} else {
  app.get("/", (req, res) => {
    res.send("api in running ...");
  });
}

app.listen(process.env.PORT, () => {
  console.log(`Backend server is running with Port ${process.env.PORT}`);
});
