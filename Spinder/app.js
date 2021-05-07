const express = require('express');
const app = express();
const static = express.static(__dirname + '/public');

const configRoutes = require('./routes');
const exphbs = require('express-handlebars');

const cookieParser = require('cookie-parser');
const session = require('express-session')
const bodyParser = require('body-parser');



app.use(cookieParser());

app.use(session({
  name: 'AuthCookie',
  secret: 'some secret string!',
  resave: false,
  saveUninitialized: true
}));

app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', exphbs({ defaultLayout: 'main', partialsDir: ['views/partials/'] }));
app.set('view engine', 'handlebars');

var hbs = exphbs.create({});

hbs.handlebars.registerHelper('json', function(context) {
  return JSON.stringify(context);
});

hbs.handlebars.registerHelper('compare', function(lvalue, rvalue, options) {

  if (arguments.length < 3)
      throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

  var operator = options.hash.operator || "==";

  var operators = {
      '==':       function(l,r) { return l == r; },
      '===':      function(l,r) { return l === r; },
      '!=':       function(l,r) { return l != r; },
      '<':        function(l,r) { return l < r; },
      '>':        function(l,r) { return l > r; },
      '<=':       function(l,r) { return l <= r; },
      '>=':       function(l,r) { return l >= r; },
      'typeof':   function(l,r) { return typeof l == r; }
  }

  if (!operators[operator])
      throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

  var result = operators[operator](lvalue,rvalue);

  if( result ) {
      return options.fn(this);
  } else {
      return options.inverse(this);
  }

});

app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

app.get('/login', async (req, res, next) => {
  if (req.session.AuthCookie) {
    res.redirect("/users");
  } 
  else {
    next();
  }
});

app.get('/users/*', async (req, res, next) => {
  if (!req.session.AuthCookie) {
    res.redirect("/login");
  } 
  else {
    next();
  }
})

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});
