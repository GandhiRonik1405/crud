const express = require("express");
const router = express.Router();
const User = require('../models/users');
const multer = require("multer");
const fs = require("fs");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

var upload = multer({
    storage: storage,
}).single("image");

router.post('/add', upload, (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename
    });

    user.save()
        .then(() => {
            req.session.message = {
                type: "success",
                message: "User Added Successfully",
            };
            res.redirect("/");
        })
        .catch((err) => {
            res.json({ message: err.message, type: "danger" });
        });

});



router.get("/", async (req, res) => {
    try {
        const users = await User.find().exec();
        res.render("index", { title: "Home page", users });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.get("/add", (req, res) => {
    res.render("addusers", { title: "Add User" });
});


router.get('/edit/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);

        if (!user) {
            // User not found, redirect to home page or handle as appropriate
            return res.redirect('/');
        }

        res.render('edit_users', {
            title: 'Edit User',
            user: user,
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});


router.post('/update/:id', upload, async (req, res) => {
    try {
        const id = req.params.id;
        let newImage = '';

        if (req.file) {
            newImage = req.file.filename;

            // Delete the old image file
            try {
                await fs.unlink(`/update/${req.body.old_image}`);
            } catch (err) {
                console.error(err);
            }
        } else {
            newImage = req.body.old_image;
        }

        // Using async/await for Mongoose update
        const result = await User.findByIdAndUpdate(
            id,
            {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                image: newImage,
            },
            { new: true } // Returns the modified document instead of the original
        );

        req.session.message = {
            type: 'success',
            message: 'User Update Success!',
        };

        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.json({ message: err.message, type: 'danger' });
    }
});



router.get("/delete/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const result = await User.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ message: "User not found" });
        }

        if (result.image !== "") {
            try {
                fs.unlinkSync("./uploads/" + result.image);
            } catch (unlinkError) {
                console.error(unlinkError);
            }
        }

        req.session.message = {
            type: "success",
            message: "User Deleted Successfully",
        };
        res.redirect("/");
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;