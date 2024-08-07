const express = require("express");
const {
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  getEnquiry,
  getallEnquiry,
} = require("../controllers/enquiryCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

//create enquiry
router.post("/create", createEnquiry);

//update enquiry
router.put("/:id", authMiddleware, isAdmin, updateEnquiry);

//delete enquiry
router.delete("/:id", authMiddleware, isAdmin, deleteEnquiry);

//get single enquiry
router.get("/:id", getEnquiry);

//get all enquiry
router.get("/", getallEnquiry);

module.exports = router;