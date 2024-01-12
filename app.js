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
      "https://www.youtube.com/embed/HM7oTRPwtUQ?si=oEds1lMHD9-AfplZ";
    recommendedQuote =
      "Cheer up, buttercup. Storms don't last forever."
  } else if (moodCounts.angry > 3) {
    recommendedVideo =
      "https://www.youtube.com/embed/wkse4PPxkk4?si=llZh25at3PtpBQkG";
    recommendedQuote =
      "Holding on to anger is like grasping a hot coal with the intent of throwing it at someone else; you are the one who gets burned";
  } else if (moodCounts.happy > 3) {
    recommendedVideo =
      "https://www.youtube.com/embed/K9I4twkMlpo?si=ytIIbOif3nKTrfrN";
    recommendedQuote =
      "Happiness is a warm puppy";
  } else if (moodCounts.neutral > 3) {
    recommendedVideo =
      "https://www.youtube.com/embed/ez3GgRqhNvA?si=Elq2TJRe3PV8skgg";
    recommendedQuote =
      "Today, may we make every moment count, and then we'll see that we have turned a normal day into a spectacular one!";
  } else {
    recommendedVideo =
    "https://www.youtube.com/embed/0FR0r0yaG6s?si=vHO3Xji__1Q08WGW";
    recommendedQuote =
      "Never regret anything that made you smile";
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

app.get('/meditation', (req, res) => {
  res.render('meditation', {
      pageTitle: 'Mindful Meditation',
      headerText: 'Welcome to Mindful Meditation',
      guidedMeditations: [
          // Array of meditation objects
      ]
  });
});

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
const calculateBMI = (req, height, weight) => {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  const category = getBMICategory(bmi);
  // Save the BMI in the session for later use
  req.session.userBMI = { bmi: bmi.toFixed(2), category };
  return { bmi: bmi.toFixed(2), category };
};
// Route to handle BMI calculation (POST request)
// Route to handle BMI calculation (POST request)
app.post("/bmi/calculate", isLoggedIn, async (req, res) => {
  const { height, weight } = req.body;
  const userId = req.session.user._id;

  try {
    const { bmi, category } = calculateBMI(req, height, weight);
    const newBMI = new BMI({
      user: userId,
      height: parseFloat(height),
      weight: parseFloat(weight),
      bmi: bmi,
      category: category,
    });

    await newBMI.save();

    // Store BMI data in session
    req.session.userBMI = { bmi: bmi, category: category };

    res.render("calculate_bmi", {
      bmi: { bmi: bmi, category: category },
      showButton: true,
    });
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

//exercise recommendation system
// Add a new route for exercise recommendations
// Function to extract video ID from YouTube URL
function getVideoIdFromUrl(url) {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regex);

  if (match && match[1]) {
    return match[1]; // Extracted video ID
  } else {
    return null; // No valid video ID found
  }
}
// Inside the /exercise_plan route
// Inside the /exercise_plan route
app.get("/exercise_plan", isLoggedIn, (req, res) => {
  const userBMI = req.session.userBMI;
  let exerciseRecommendations = [];

  if (userBMI && userBMI.category === 'Underweight') {
    exerciseRecommendations = [
      {
        category: 'Underweight',
        exercises: {
          abs: [
            {
              name: 'Crunches',
              videoId: getVideoIdFromUrl('https://youtu.be/0t4t3IpiEao?si=PuzMl-BLzosds6gK'),
            },
            {
              name: 'Leg raises',
              videoId: getVideoIdFromUrl('https://youtu.be/RuIdJSVTKO4?si=QYGDF5vOFnOMQ-uP'),
            },
            {
              name: 'Russian twists',
              videoId: getVideoIdFromUrl('https://youtu.be/DJQGX2J4IVw?si=-v9TAcOLGek4HJvk'),
            },
            {
              name: 'Mountain climbers',
              videoId: getVideoIdFromUrl('https://youtu.be/cnyTQDSE884?si=xWFwr7uyjym0rGsu'),
            },
            {
              name: 'Plank',
              videoId: getVideoIdFromUrl('https://youtu.be/6LqqeBtFn9M?si=sE7IECJIEXndi9EC'),
            },
            {
              name: 'Hanging leg raises',
              videoId: getVideoIdFromUrl('https://youtu.be/Voa4JvQ76A8?si=UiZv0VSwf76S60IJ'),
            },
          ],
          legs: [
            {
              name: 'Calf raises',
              videoId: getVideoIdFromUrl('https://youtu.be/c5Kv6-fnTj8?si=vTymlms4tpy8es6D'),
            },
            {
              name: 'Box jumps',
              videoId: getVideoIdFromUrl('https://youtu.be/52r_Ul5k03g?si=KptJ389cH3aPQWwT'),
            },
            {
              name: 'Hamstring curls',
              videoId: getVideoIdFromUrl('https://youtu.be/XkESHgkTdFw?si=U5QfP6PxubbsNpzi'),
            },
            {
              name: 'Squat',
              videoId: getVideoIdFromUrl('https://youtu.be/YaXPRqUwItQ?si=ST3HtJi598EooDJt'),
            },
            {
              name: 'Lunges',
              videoId: getVideoIdFromUrl('https://youtu.be/wrwwXE_x-pQ?si=X0YgEf-CQRXSvg2s'),
            },
            {
              name: 'Leg press',
              videoId: getVideoIdFromUrl('https://youtu.be/IZxyjW7MPJQ?si=7G91tqyocdkiALD-'),
            },
          ],
          // arms: [
          //   {
          //     name: 'Bicep curls',
          //     videoId: getVideoIdFromUrl('https://youtu.be/sYV-ki-1blM?si=NjgY36GmNL5NQfdm'),
          //   },
          //   {
          //     name: 'Tricep dips',
          //     videoId: getVideoIdFromUrl('https://youtu.be/6kALZikXxLc?si=KeMbQw4WwlbPQvXy'),
          //   },
          //   {
          //     name: 'Push ups',
          //     videoId: getVideoIdFromUrl('https://youtu.be/IODxDxX7oi4?si=P35DUgTF6B_Idt0x'),
          //   },
          //   {
          //     name: 'Skull crushers',
          //     videoId: getVideoIdFromUrl('https://youtu.be/ir5PsbniVSc?si=3oy5OClUVnnxT4cf'),
          //   },
          //   {
          //     name: 'Dumbbell kickback',
          //     videoId: getVideoIdFromUrl('https://youtu.be/ShCYaoHmWmk?si=FkE2PFkDeLkdgBH7'),
          //   },
          // ],
          // back: [
          //   {
          //     name: 'Face pulls',
          //     videoId: getVideoIdFromUrl('https://youtu.be/0Po47vvj9g4?si=cQloW6VUrwHQRfrV'),
          //   },
          //   {
          //     name: 'Reverse flyers',
          //     videoId: getVideoIdFromUrl('https://youtu.be/JoCRRZ3zRtI?si=VEus6b3C3yQLsHzD'),
          //   },
          //   {
          //     name: 'T-bar rows',
          //     videoId: getVideoIdFromUrl('https://youtu.be/hYo72r8Ivso?si=0N1rxmGQYnOydzuH'),
          //   },
          //   {
          //     name: 'Deadlifts',
          //     videoId: getVideoIdFromUrl('https://youtu.be/1ZXobu7JvvE?si=QzrTekoJfMLqKS-p'),
          //   },
          //   {
          //     name: 'Lat pulldowns',
          //     videoId: getVideoIdFromUrl('https://youtu.be/B01ZSLFQjzE?si=bgu8gikb55KXSip3'),
          //   },
          // ],
          // chest: [
          //   {
          //     name: 'Bench press',
          //     videoId: getVideoIdFromUrl('https://youtu.be/rT7DgCr-3pg?si=qZwzNn4Zsu73aKVZ'),
          //   },
          //   {
          //     name: 'Dumbbell flyers',
          //     videoId: getVideoIdFromUrl('https://youtu.be/QENKPHhQVi4?si=FzIvY0c_8Lj4zZxn'),
          //   },
          //   {
          //     name: 'Incline bench press',
          //     videoId: getVideoIdFromUrl('https://youtu.be/SrqOu55lrYU?si=Ap2mYdk2JiKilHQU'),
          //   },
          //   {
          //     name: 'Chest dips',
          //     videoId: getVideoIdFromUrl('https://youtu.be/4la6BkUBLgo?si=vRikokkY3BCEuoq4'),
          //   },
          //   {
          //     name: 'Pec deck machine',
          //     videoId: getVideoIdFromUrl('https://youtu.be/O-OBCfyh9Fw?si=-zxjR71D97rPhalU'),
          //   },
          // ],
          // shoulders: [
          //   {
          //     name: 'Shrugs',
          //     videoId: getVideoIdFromUrl('https://youtu.be/SX1FE0URdv8?si=r-GPkvwXllCf323P'),
          //   },
          //   {
          //     name: 'Upright rows',
          //     videoId: getVideoIdFromUrl('https://youtu.be/VIoihl5ZZzM?si=BDhzfuRcpqpmDPEl'),
          //   },
          //   {
          //     name: 'Arnold press',
          //     videoId: getVideoIdFromUrl('https://youtu.be/3ml7BH7mNwQ?si=0JDCQOn1tNZSh-iw'),
          //   },
          //   {
          //     name: 'Overhead press',
          //     videoId: getVideoIdFromUrl('https://youtu.be/M2rwvNhTOu0?si=MUhCG0H2jGVAoYwX'),
          //   },
          //   {
          //     name: 'Lateral raises',
          //     videoId: getVideoIdFromUrl('https://youtu.be/XPPfnSEATJA?si=UOML4PooEXThwYez'),
          //   },
          // ],
        },
      },
    ];
  }else if (userBMI && userBMI.category === 'Overweight') {
    exerciseRecommendations = [
      {
        category: 'Overweight',
        exercises: {
          cardiovascular: [
            {
              name: 'Cycling',
              videoId: getVideoIdFromUrl('https://youtu.be/J5fYP7DrZjw?si=3nrntxWcvCWjdsb6'),
            },
            {
              name: 'Swimming',
              videoId: getVideoIdFromUrl('https://youtu.be/nlGsZTsZaFc?si=YSPfwBpx80VtZHX_'),
            },
            {
              name: 'Elliptical Training',
              videoId: getVideoIdFromUrl('https://youtu.be/F0oRyJCEzfA?si=EnBFsaf6jkRuN88y'),
            },
            {
              name: 'Jump Rope',
              videoId: getVideoIdFromUrl('https://youtu.be/oHk1MLVEM-E?si=SQshYR3YAQ_xT7U6'),
            },
          ],
          legs: [
            {
              name: 'Walking Lunges',
              videoId: getVideoIdFromUrl('https://youtu.be/2nk3yjfdGz4?si=uAHXbVNvvLPiPu8Q'),
            },
            {
              name: 'Stationary Bike (Cycling)',
              videoId: getVideoIdFromUrl('https://youtu.be/4Hl1WAGKjMc?si=VGcWcytc6cTsDFQ9'),
            },
            {
              name: 'Step-Ups',
              videoId: getVideoIdFromUrl('https://youtu.be/Pt5K8zMrwgI?si=DoO8rqxJv-rlORNx'),
            },
            {
              name: 'Leg Press Machine',
              videoId: getVideoIdFromUrl('https://youtu.be/8EMbB0tCn7Q?si=IhdtGKEl1M6y63kq'),
            },
            {
              name: 'Bodyweight Squats with Stability Ball',
              videoId: getVideoIdFromUrl('https://youtu.be/EzxYTsfuB6c?si=UPiDNzLg8RkZUmH5'),
            },
            {
              name: 'Lateral Leg Raises',
              videoId: getVideoIdFromUrl('https://youtu.be/aDPCxEXR_9Q?si=l-YRWQnnOUAgiB7M'),
            },
          ],
          arms: [
            {
              name: 'Chair Dips',
              videoId: getVideoIdFromUrl('https://youtu.be/6kALZikXxLc?si=KeMbQw4WwlbPQvXy'),
            },
            {
              name: 'Bicep Curls with Light Weights',
              videoId: getVideoIdFromUrl('https://youtu.be/sYV-ki-1blM?si=NjgY36GmNL5NQfdm'),
            },
            {
              name: 'Arm Circles',
              videoId: getVideoIdFromUrl('https://youtu.be/UVMEnIaY8aU?si=gNHUWU1aQi0CEDTX'),
            },
            {
              name: 'Tricep Kickbacks',
              videoId: getVideoIdFromUrl('https://youtu.be/ZO81bExngMI?si=4f3RjXla5GXHWJr0'),
            },
            {
              name: 'Resistance Band Bicep Curls',
              videoId: getVideoIdFromUrl('https://youtu.be/sYV-ki-1blM?si=NjgY36GmNL5NQfdm'),
            },
            {
              name: 'Battle Ropes',
              videoId: getVideoIdFromUrl('https://youtu.be/pQb2xIGioyQ?si=J80GLMJV2-ebHEBH'),
            },
          ],
          back: [
            {
              name: 'Lat Pulldowns',
              videoId: getVideoIdFromUrl('https://youtu.be/B01ZSLFQjzE?si=bgu8gikb55KXSip3'),
            },
            {
              name: 'Seated Rows',
              videoId: getVideoIdFromUrl('https://youtu.be/TeFo51Q_Nsc?si=OXbumLscB5piovsh'),
            },
            {
              name: 'Back Extensions',
              videoId: getVideoIdFromUrl('https://youtu.be/eHbdjqkwvks?si=QYN8thIE1lNx_Ocj'),
            },
            {
              name: 'Superman Exercise',
              videoId: getVideoIdFromUrl('https://youtu.be/h2iKcNldw-g?si=31ulUeKQiXrSIlQA'),
            },
            {
              name: 'Bent-Over Dumbbell Rows',
              videoId: getVideoIdFromUrl('https://youtu.be/knB5Q4FN4ck?si=mj8NujXcjLyivHiL'),
            },
          ],
          chest: [
            {
              name: 'Modified Push-Ups',
              videoId: getVideoIdFromUrl('https://youtu.be/SVfWdQTyEMs?si=szVhPn19OeRomEye'),
            },
            {
              name: 'Pec Deck Machine',
              videoId: getVideoIdFromUrl('https://youtu.be/O-OBCfyh9Fw?si=-zxjR71D97rPhalU'),
            },
            {
              name: 'Seated Shoulder Press',
              videoId: getVideoIdFromUrl('https://youtu.be/TsduLWuhlFM?si=KnleUyrBiXlHsYB4'),
            },
            {
              name: 'Front and Lateral Raises with Light Weights',
              videoId: getVideoIdFromUrl('https://youtu.be/sOcYlBI85hc?si=hV2q7VoghKb3VGo7'),
            },
            {
              name: 'Push-Up Variations',
              videoId: getVideoIdFromUrl('https://youtu.be/tWjBnQX3if0?si=dlK_RW4Dx2j1dj35'),
            },
            {
              name: 'Medicine Ball Chest Pass',
              videoId: getVideoIdFromUrl('https://youtube.com/shorts/PhxzbdElDnM?si=5OOX6yV0nzLcRHU4'),
            },
          ],
          shoulders: [
            {
              name: 'Shrugs',
              videoId: getVideoIdFromUrl('https://youtu.be/SX1FE0URdv8?si=r-GPkvwXllCf323P'),
            },
            {
              name: 'Upright Rows',
              videoId: getVideoIdFromUrl('https://youtu.be/VIoihl5ZZzM?si=BDhzfuRcpqpmDPEl'),
            },
            {
              name: 'Arnold Press',
              videoId: getVideoIdFromUrl('https://youtu.be/3ml7BH7mNwQ?si=0JDCQOn1tNZSh-iw'),
            },
            {
              name: 'Overhead Press',
              videoId: getVideoIdFromUrl('https://youtu.be/M2rwvNhTOu0?si=MUhCG0H2jGVAoYwX'),
            },
            {
              name: 'Lateral Raises',
              videoId: getVideoIdFromUrl('https://youtu.be/XPPfnSEATJA?si=UOML4PooEXThwYez'),
            },
          ],
          core: [
            {
              name: 'Plank',
              videoId: getVideoIdFromUrl('https://youtu.be/6LqqeBtFn9M?si=sE7IECJIEXndi9EC'),
            },
            {
              name: 'Bodyweight Squats',
              videoId: getVideoIdFromUrl('https://youtu.be/l83R5PblSMA?si=30K_SkTMptFc_ibX'),
            },
            {
              name: 'Modified Russian Twists',
              videoId: getVideoIdFromUrl('https://youtu.be/DJQGX2J4IVw?si=-v9TAcOLGek4HJvk'),
            },
            {
              name: 'Side Plank',
              videoId: getVideoIdFromUrl('https://youtu.be/9dNL_mtObGQ?si=8-K5jCARupevrSCZ'),
            },
            {
              name: 'Hollow Body Hold',
              videoId: getVideoIdFromUrl('https://youtu.be/TNHSgs_orU0?si=K6hDR2uv4ErWs7MP'),
            },
            {
              name: 'Reverse Crunches',
              videoId: getVideoIdFromUrl('https://youtu.be/XY8KzdDcMFg?si=tIdT3YR6pdT5b6Mp'),
            },
          ],
          flexibility: [
            {
              name: 'Yoga',
              videoId: getVideoIdFromUrl('https://youtu.be/wxJBHWPNPkg?si=AlKmfA9xhwqqF-PX'),
            },
            {
              name: 'Static Stretching',
              videoId: getVideoIdFromUrl('https://youtu.be/uO4KFToGWS0?si=czwJfrD6Qlh39p7F'),
            },
            {
              name: 'Tai Chi',
              videoId: getVideoIdFromUrl('https://youtu.be/Q6aZ-VQWWFM?si=6ONSeYr4Vu986Tta'),
            },
            {
              name: 'Foam Rolling',
              videoId: getVideoIdFromUrl('https://youtu.be/KWGsSq0J1Bk?si=A71wtVhgZLBYEekH'),
            },
            {
              name: 'Dynamic Stretching Routine',
              videoId: getVideoIdFromUrl('https://youtu.be/Vw7PdhxPCS4?si=0pJBnJXc4KEHf-Ch'),
            },
            {
              name: 'Pilates',
              videoId: getVideoIdFromUrl('https://youtu.be/9Te82opGhiQ?si=8-1wLmYm5zqXExdY'),
            },
          ],
        },
      },
    ];
  }else if (userBMI && userBMI.category === 'Normal weight') {
    exerciseRecommendations = [
      {
        category: 'Normal weight',
        exercises: {
          cardiovascular: [
            {
              name: 'Running or Jogging',
              videoId: getVideoIdFromUrl('https://youtu.be/ZlhCyrTTT4U?si=vxBCzwgPCfJzNIel'),
            },
            {
              name: 'Cycling',
              videoId: getVideoIdFromUrl('https://youtu.be/J5fYP7DrZjw?si=3nrntxWcvCWjdsb6'),
            },
            {
              name: 'Swimming',
              videoId: getVideoIdFromUrl('https://youtu.be/nlGsZTsZaFc?si=YSPfwBpx80VtZHX_'),
            },
            {
              name: 'Elliptical Training',
              videoId: getVideoIdFromUrl('https://youtu.be/F0oRyJCEzfA?si=EnBFsaf6jkRuN88y'),
            },
            {
              name: 'Jump Rope',
              videoId: getVideoIdFromUrl('https://youtu.be/oHk1MLVEM-E?si=SQshYR3YAQ_xT7U6'),
            },
          ],
          legs: [
            {
              name: 'Barbell Back Squats',
              videoId: getVideoIdFromUrl('https://youtu.be/rrJIyZGlK8c?si=0K3xe27hiZZ_EO_M'),
            },
            {
              name: 'Walking Lunges with Dumbbells',
              videoId: getVideoIdFromUrl('https://youtu.be/2nk3yjfdGz4?si=uAHXbVNvvLPiPu8Q'),
            },
            {
              name: 'Box jumps',
              videoId: getVideoIdFromUrl('https://youtu.be/52r_Ul5k03g?si=KptJ389cH3aPQWwT'),
            },
            {
              name: 'Hamstring curls',
              videoId: getVideoIdFromUrl('https://youtu.be/XkESHgkTdFw?si=U5QfP6PxubbsNpzi'),
            },
            {
              name: 'Lunges',
              videoId: getVideoIdFromUrl('https://youtu.be/wrwwXE_x-pQ?si=X0YgEf-CQRXSvg2s'),
            },
            {
              name: 'Leg press',
              videoId: getVideoIdFromUrl('https://youtu.be/IZxyjW7MPJQ?si=7G91tqyocdkiALD-'),
            },
          ],
          arms: [
            {
              name: 'Chair Dips',
              videoId: getVideoIdFromUrl('https://youtu.be/6kALZikXxLc?si=KeMbQw4WwlbPQvXy'),
            },
            {
              name: 'Bicep Curls with Light Weights',
              videoId: getVideoIdFromUrl('https://youtu.be/sYV-ki-1blM?si=NjgY36GmNL5NQfdm'),
            },
            {
              name: 'Arm Circles',
              videoId: getVideoIdFromUrl('https://youtu.be/UVMEnIaY8aU?si=gNHUWU1aQi0CEDTX'),
            },
            {
              name: 'Bicep curls',
              videoId: getVideoIdFromUrl('https://youtu.be/sYV-ki-1blM?si=NjgY36GmNL5NQfdm'),
            },
            {
              name: 'Tricep bips',
              videoId: getVideoIdFromUrl('https://youtu.be/6kALZikXxLc?si=KeMbQw4WwlbPQvXy'),
            },
            {
              name: 'Push ups',
              videoId: getVideoIdFromUrl('https://youtu.be/IODxDxX7oi4?si=P35DUgTF6B_Idt0x'),
            },
          ],
          back: [
            {
              name: 'Face pulls',
              videoId: getVideoIdFromUrl('https://youtu.be/0Po47vvj9g4?si=cQloW6VUrwHQRfrV'),
            },
            {
              name: 'Reverse flyers',
              videoId: getVideoIdFromUrl('https://youtu.be/JoCRRZ3zRtI?si=VEus6b3C3yQLsHzD'),
            },
            {
              name: 'T-bar rows',
              videoId: getVideoIdFromUrl('https://youtu.be/hYo72r8Ivso?si=0N1rxmGQYnOydzuH'),
            },
            {
              name: 'Deadlifts',
              videoId: getVideoIdFromUrl('https://youtu.be/1ZXobu7JvvE?si=QzrTekoJfMLqKS-p'),
            },
            {
              name: 'Lat pulldowns',
              videoId: getVideoIdFromUrl('https://youtu.be/B01ZSLFQjzE?si=bgu8gikb55KXSip3'),
            },
          ],
          chest: [
            {
              name: 'Bench press',
              videoId: getVideoIdFromUrl('https://youtu.be/rT7DgCr-3pg?si=qZwzNn4Zsu73aKVZ'),
            },
            {
              name: 'Dumbbell flyers',
              videoId: getVideoIdFromUrl('https://youtu.be/QENKPHhQVi4?si=FzIvY0c_8Lj4zZxn'),
            },
            {
              name: 'Incline bench press',
              videoId: getVideoIdFromUrl('https://youtu.be/SrqOu55lrYU?si=Ap2mYdk2JiKilHQU'),
            },
            {
              name: 'Chest dips',
              videoId: getVideoIdFromUrl('https://youtu.be/4la6BkUBLgo?si=vRikokkY3BCEuoq4'),
            },
            {
              name: 'Pec deck machine',
              videoId: getVideoIdFromUrl('https://youtu.be/O-OBCfyh9Fw?si=-zxjR71D97rPhalU'),
            },
          ],
          core: [
            {
              name: 'Plank',
              videoId: getVideoIdFromUrl('https://youtu.be/6LqqeBtFn9M?si=sE7IECJIEXndi9EC'),
            },
            {
              name: 'Bodyweight Squats',
              videoId: getVideoIdFromUrl('https://youtu.be/l83R5PblSMA?si=30K_SkTMptFc_ibX'),
            },
            {
              name: 'Modified Russian Twists',
              videoId: getVideoIdFromUrl('https://youtu.be/DJQGX2J4IVw?si=-v9TAcOLGek4HJvk'),
            },
            {
              name: 'Side Plank',
              videoId: getVideoIdFromUrl('https://youtu.be/9dNL_mtObGQ?si=8-K5jCARupevrSCZ'),
            },
            {
              name: 'Hollow Body Hold',
              videoId: getVideoIdFromUrl('https://youtu.be/TNHSgs_orU0?si=K6hDR2uv4ErWs7MP'),
            },
            {
              name: 'Reverse Crunches',
              videoId: getVideoIdFromUrl('https://youtu.be/XY8KzdDcMFg?si=tIdT3YR6pdT5b6Mp'),
            },
          ],
          flexibility: [
            {
              name: 'Yoga',
              videoId: getVideoIdFromUrl('https://youtu.be/wxJBHWPNPkg?si=AlKmfA9xhwqqF-PX'),
            },
            {
              name: 'Static Stretching',
              videoId: getVideoIdFromUrl('https://youtu.be/uO4KFToGWS0?si=czwJfrD6Qlh39p7F'),
            },
            {
              name: 'Tai Chi',
              videoId: getVideoIdFromUrl('https://youtu.be/Q6aZ-VQWWFM?si=6ONSeYr4Vu986Tta'),
            },
            {
              name: 'Foam Rolling',
              videoId: getVideoIdFromUrl('https://youtu.be/KWGsSq0J1Bk?si=A71wtVhgZLBYEekH'),
            },
            {
              name: 'Dynamic Stretching Routine',
              videoId: getVideoIdFromUrl('https://youtu.be/Vw7PdhxPCS4?si=0pJBnJXc4KEHf-Ch'),
            },
            {
              name: 'Pilates',
              videoId: getVideoIdFromUrl('https://youtu.be/9Te82opGhiQ?si=8-1wLmYm5zqXExdY'),
            },
          ],
        },
      },
    ];
  }

  res.render("exercise_plan", { exerciseRecommendations });
});

  // New route for underweight diet recipes
  app.get("/underweight_diet_recipes", isLoggedIn, (req, res) => {
    res.render("bulk"); // Render the Underweight Diet Recipes page
  });

 // New route for overweight diet recipes

 app.get("/overweight_diet_recipes", isLoggedIn, (req, res) => {
  res.render("lowcarb"); // Render the overweight Diet Recipes page
});
app.get("/weightloss_diet_recipes", isLoggedIn, (req, res) => {
  res.render("weightloss"); // Render the Weight Loss Diet Recipes page
});


 // New route for Normal weight diet recipes

 app.get("/keto_diet_recipes", isLoggedIn, (req, res) => {
  res.render("keto"); // Render the overweight Diet Recipes page
});
app.get("/lowcarb_diet_recipes", isLoggedIn, (req, res) => {
  res.render("lowcarb"); // Render the Weight Loss Diet Recipes page
});


  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
