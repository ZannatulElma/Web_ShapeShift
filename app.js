const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

//Express JS connection
const app = express();
const port = 3000;
const MongoDbURI = "mongodb://127.0.0.1:27017/shapeshift";

//Database Connection
mongoose.connect(MongoDbURI);

//Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

//Database Models
const User = require("./models/userModel");
const Mood = require("./models/moodModel");
const moodsArr = Mood.schema.path("mood").enumValues;
const BMI = require("./models/bmiModel");
//isLoggedIn
const isLoggedIn = (req, res, next) => {
  if (req.session.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

//Views

//Home Page
app.get("/", isLoggedIn, (req, res) => {
  res.render("landingpage");
});

//Login
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email }).then((user) => {
    if (user && user.email === email && user.password === password) {
      req.session.isLoggedIn = true;
      req.session.user = user;
      res.redirect("/");
    } else {
      res.render("login", { error: "Invalid email or password" });
    }
  });
});

//Sign Up
app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", (req, res) => {
  const { username, email, password } = req.body;

  // Check if email is already in use
  User.findOne({ email }).then((existingUser) => {
    if (existingUser) {
      return res.render("signup", { error: "Email is already in use" });
    } else {
      const newUser = new User({
        username: username,
        email: email,
        password: password,
      });

      newUser.save().then((savedUser) => {
        res.redirect("/");
      });
    }
  });
});

//Logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

//Mood Tracker
app.get("/moodtracker", isLoggedIn, async (req, res) => {
  const user = req.session.user;

  // Last 7 mood entries
  const last7Moods = await Mood.find({ user: user._id })
    .sort({ date: -1 })
    .limit(7);
  last7Moods.reverse();

  // Count the occurrences of each mood
  const moodCounts = {
    happy: 0,
    sad: 0,
    angry: 0,
    neutral: 0,
  };

  // Update the counts based on last7Moods
  for (const moodEntry of last7Moods) {
    const mood = moodEntry.mood;
    moodCounts[mood] += 1;
  }

  let recommendedVideo, recommendedQuote;

  // Logic to determine recommendations based on mood counts
  if (moodCounts.sad > 3) {
    recommendedVideo =
      "https://www.youtube.com/embed/dQw4w9WgXcQ?si=HM19UgfNpv1roDWR";
    recommendedQuote =
      "You must be the change you wish to see in the world. -Mahatma Gandhi";
  } else if (moodCounts.angry > 3) {
    recommendedVideo =
      "https://www.youtube.com/embed/dQw4w9WgXcQ?si=HM19UgfNpv1roDWR";
    recommendedQuote =
      "You must be the change you wish to see in the world. -Mahatma Gandhi";
  } else if (moodCounts.happy > 3) {
    recommendedVideo =
      "https://www.youtube.com/embed/dQw4w9WgXcQ?si=HM19UgfNpv1roDWR";
    recommendedQuote =
      "You must be the change you wish to see in the world. -Mahatma Gandhi";
  } else if (moodCounts.neutral > 3) {
    recommendedVideo =
      "https://www.youtube.com/embed/dQw4w9WgXcQ?si=HM19UgfNpv1roDWR";
    recommendedQuote =
      "You must be the change you wish to see in the world. -Mahatma Gandhi";
  } else {
    recommendedVideo =
      "https://www.youtube.com/embed/dQw4w9WgXcQ?si=HM19UgfNpv1roDWR";
    recommendedQuote =
      "You must be the change you wish to see in the world. -Mahatma Gandhi";
  }

  res.render("moodtracker", {
    user,
    moodsArr,
    last7Moods,
    recommendedVideo,
    recommendedQuote,
  });
});

app.post("/addMood", async (req, res) => {
  const { selectedMood, note } = req.body;
  const userId = req.session.user._id;

  const currentDate = new Date().toISOString().split("T")[0];

  const existingMood = await Mood.findOne({
    user: userId,
    date: currentDate,
  });

  if (existingMood) {
    //update
    existingMood.mood = selectedMood;
    existingMood.note = note;
    existingMood.save();
  } else {
    //create
    const newMood = new Mood({
      user: userId,
      mood: selectedMood,
      note: note,
      date: currentDate,
    });

    newMood.save();
  }

  res.redirect("/moodtracker");
});

// Reset Mood
app.get("/resetMoods", isLoggedIn, async (req, res) => {
  const userId = req.session.user._id;
  await Mood.deleteMany({ user: userId });
  res.redirect("/moodtracker");
});



// MEAL PLANNING PART START //

app.get("/mealfrontpage", (req, res) => {
  res.render("mealfrontpage");
});

app.get("/mealplans", (req, res) => {
  res.render("mealplans");
});

app.get("/keto", (req, res) => {
  res.render("keto");
});

app.get("/weightloss", (req, res) => {
  res.render("weightloss");
});

app.get("/lowcarb", (req, res) => {
  res.render("lowcarb");
});

app.get("/bulk", (req, res) => {
  res.render("bulk");
});

app.get("/recipe1", (req, res) => {
  res.render("recipe1");
});

app.get("/recipe1", (req, res) => {
  res.render("recipe1");
});

app.get("/recipe2", (req, res) => {
  res.render("recipe2");
});

app.get("/recipe3", (req, res) => {
  res.render("recipe3");
});

app.get("/recipe4", (req, res) => {
  res.render("recipe4");
});

// MEAL PLANNING PART END //

//bmi tracker part//
// app.get("/bmi/calculate", isLoggedIn, (req, res) => {
// res.render("calculate_bmi");
// });

// Route to display the BMI calculator form
app.get("/calculate_bmi", isLoggedIn, (req, res) => {
  res.render("calculate_bmi", { bmi: null });
});
// BMI Categories
const getBMICategory = (bmi) => {
  if (bmi < 18.5) {
    return 'Underweight';
  } else if (bmi >= 18.5 && bmi < 25) {
    return 'Normal weight';
  } else {
    return 'Overweight';
  }
};

// Calculate BMI function
const calculateBMI = (height, weight) => {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  const category = getBMICategory(bmi);
  return { bmi: bmi.toFixed(2), category };
};
// Route to handle BMI calculation (POST request)
// Route to handle BMI calculation (POST request)
app.post("/bmi/calculate", isLoggedIn, async (req, res) => {
  // Handle BMI calculation here using the submitted data
  const { height, weight } = req.body;
  const userId = req.session.user._id;
  const { bmi, category } = calculateBMI(height, weight);

  try {
    const newBMI = new BMI({
      user: userId,
      height: parseFloat(height),
      weight: parseFloat(weight),
      bmi: bmi,
      category: category,
    });

    await newBMI.save();

    // Render the 'calculate_bmi' page with BMI data
    res.render("calculate_bmi", { bmi: { bmi, category } });
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate and save BMI data" });
  }
});

// // View the latest BMI for a user
// app.get("/view_bmi", isLoggedIn, (req, res) => {
//   const userId = req.session.user._id;

//   BMI.findOne({ user: userId })
//     .sort({ _id: -1 }) // Sort by descending order to get the latest BMI record
//     .then((latestBMI) => {
//       res.render("view_bmi", { latestBMI });
//     }).catch((error) => {
//       res.status(500).json({ error: "Failed to fetch latest BMI data" });
//     });
// });

// View all BMI records for a user
// app.get("/bmi/history", isLoggedIn, (req, res) => {
//   const userId = req.session.user._id;

//   BMI.find({ user: userId })
//     .sort({ _id: -1 }) // Sort by descending order to get the latest BMI record first
//     .then((allBMIRecords) => {
//       res.json({ allBMIRecords });
//     }).catch((error) => {
//       res.status(500).json({ error: "Failed to fetch BMI history" });
//     });
// });




// // Route to display the latest BMI and option to view history
// app.get("/bmi/latest", isLoggedIn, (req, res) => {
//   const userId = req.session.user._id;

//   BMI.findOne({ user: userId })
//     .sort({ _id: -1 })
//     .then((latestBMI) => {
//       res.render("view_bmi", { latestBMI });
//     }).catch((error) => {
//       res.render("view_bmi", { latestBMI: null });
//     });
// });

// Route to display the entire BMI history for a user
app.get("/bmi/history/all", isLoggedIn, async (req, res) => {
  const userId = req.session.user._id;

  try {
    // Fetch the last 5 BMI records for the user
    const last5BMIRecords = await BMI.find({ user: userId })
      .sort({ _id: -1 })
      .limit(5);

    res.render("view_bmi_history_all", { allBMIRecords: last5BMIRecords });
  } catch (error) {
    res.status(500).send("Failed to fetch BMI history");
  }
});
// ... (existing code)

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
