import express from "express";
import cors from "cors"
import reportRouter from "./routes/reportRouter.js";
import bodyParser from "body-parser";

const app = express()
const port = 4000

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//endpoints
app.use("/report", reportRouter)


app.get("/", (req, res) => {
  res.send("Server is Online")
});

app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`)
});