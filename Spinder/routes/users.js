const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users;
const schemas = require('../data/schemas');

//checks if there are any new items in newArray
function containsNew(originalArray, newArray){
    for (x of newArray){
        if (originalArray.includes(x)===false){
            return true;
        }
    }
    return false;
}
//route for updating user id
router.post('/:id', async (req,res)=> {
    const {firstName, lastName, bio, country, city} = req.body;
    let updatedUser = {
        firstName: firstName,
        lastName: lastName,
        location: {
            country: country,
            city: city
        },
        bio: bio
    }
    try{
        const user = await userData.updateUser(req.params.id, updatedUser);
        res.redirect('/'+req.params.id);
    }catch(e){
        console.log(e);
        res.json({error: e.message});
    }
});

router.get('/', async (req, res) => {
    try{
        const userList = await userData.getAllUsers();
        console.log(req.session.user);
        // const curr_user = await userData.getUserById(req.session.user);
        console.log(userList);
        res.status(200).render('users', {title: "Users", users : userList, isLoggedIn: true});

    }
    catch(e){
        console.log(e);
        res.status(500).send({error:e});
    }
});

// If viewing our own profile, show all attributes. Otherwise, toggle something
router.get('/:id', async (req, res) => {
    try{
        const user = await userData.getUserById(req.params.id);
        // const curr_user = await userData.getUserById(req.session.user);
        res.render('profile',{user : user, topArtists: user.topArtists, topSongs: user.topSongs, playlists: user.playlists, isLoggedIn: true});
        console.log(user);
        //res.status(200).json(user);
    }
    catch(e){
        console.log(e);
        res.status(500).send({error:e.message});
    }
});

router.post('/', async (req, res) => {
    const updatedData = req.body;
    const result=schemas.userSchema.validate(updatedData);
    if(result.error){
        res.status(400).json({error:result.error});
        return;
    }
    let newUser=result.value;
    try {
        const addedUser = await userData.addUser(newUser);
        res.status(200).json(addedUser);
    }
    catch(e){
        res.status(500).send({error: e});
    }
});


router.put('/:id', async(req, res)=> {
    const updatedData = req.body;
    const result=schemas.userSchema.validate(updatedData);
    if(result.error){
        res.status(400).json({error:result.error});
        return;
    }
    let updatedInfo=result.value;
    try{
        await userData.getUserById(req.params.id);
    }
    catch(e){
        res.status(404).json({ error: 'User not found' });
        return;
    }
    try {
        const updatedUser = await userData.updateUser(req.params.id, updatedInfo);
        res.status(200).json(updatedUser);
    }
    catch(e){
        res.status(500).send({error: e});
    }
});

router.patch('/:id', async (req, res) => {
    try{
        await userData.getUserById(req.params.id);
    }
    catch(e){
        res.status(404).json({ error: 'User not found' });
        return;
    }
    const updatedBody = req.body;
    const result=schemas.userSchema.validate(updatedBody);
    if(result.error){
        res.status(400).json({error:result.error});
        return;
    }
    let oldUser = await userData.getUserById(req.params.id);
    let updatedInfo=result.value;
    let updatedData = {};
    if(updatedInfo.firstName && updatedInfo.firstName != oldUser.firstName){
        updatedData.firstName = updatedInfo.firstName;
    }
    if(updatedInfo.lastName && updatedInfo.lastName != oldUser.lastName){
        updatedData.lastName = updatedInfo.lastName;
    }
    if(updatedInfo.username && updatedInfo.username != oldUser.username){
        updatedData.username = updatedInfo.username;
    }
    if(updatedInfo.email && updatedInfo.email != oldUser.email){
        updatedData.email = updatedInfo.email;
    }
    if(updatedInfo.access_token && updatedInfo.access_token != oldUser.access_token){
        updatedData.access_token = updatedInfo.access_token;
    }
    if(updatedInfo.refresh_token && updatedInfo.refresh_token != oldUser.refresh_token){
        updatedData.refresh_token = updatedInfo.refresh_token;
    }
    if(updatedInfo.location && updatedInfo.location != oldUser.location){
        updatedData.location = updatedInfo.location;
    }
    if(updatedInfo.img && updatedInfo.img != oldUser.img){
        updatedData.img = updatedInfo.img;
    }
    if(updatedInfo.musicalProfile && updatedInfo.musicalProfile != oldUser.musicalProfile){
        updatedData.musicalProfile = updatedInfo.musicalProfile;
    }
    if(updatedInfo.topArtists){
        if(containsNew(oldArtist.topArtists,updatedInfo.topArtists)){
            updatedData.topArtists = updatedInfo.topArtists;
        }
    }
    if(updatedInfo.topSongs){
        if(containsNew(oldArtist.topSongs,updatedInfo.topSongs)){
            updatedData.topSongs = updatedInfo.topSongs;
        }
    }
    if(updatedInfo.playlists){
        if(containsNew(oldArtist.playlists,updatedInfo.playlists)){
            updatedData.playlists = updatedInfo.playlists;
        }
    }
    if(updatedInfo.likedProfiles){
        if(containsNew(oldArtist.likedProfiles,updatedInfo.likedProfiles)){
            updatedData.likedProfiles = updatedInfo.likedProfiles;
        }
    }
    if (Object.keys(updatedData).length <1){
        res.status(400).json({error: 'Must update at least 1 field'});
        return;
    }
    try{
        const updatedArtist = await userData.updateUser(req.params.id, updatedData);
        res.status(200).json(updatedArtist);

    }
    catch(e){
        res.status(400).send({error:e});
    }
});

router.delete('/:id', async (req, res) => {
    try{
        await userData.getUserById(req.params.id);
    }
    catch(e){
        res.status(404).json({ error: 'User not found' });
        return;
    }
    try {
      const deletedUser = await userData.removeUser(req.params.id);
      res.status(200).json(deletedUser);
    } catch (e) {
        res.status(500).send({error: e});
    }
});

router.post('/login', async (req, res) => {
    try{
        const {username, password} = req.body;
        let user=userData.getUserBySpotifyUsername(username);
        if(user){
            let valid = await bcrypt.compare(password, user.hashedPassword);
            if (valid){
            //make cookie/add session
            req.session.AuthCookie = true;
            res.redirect('/users');
            }
            else{
                res.status(401).render('login', {title: "Error", error: "Invalid username or password"});
            }
        }
        else{
            res.status(401).render('login', {title: "Error", error: "Invalid username or password"});
        }
    }
    catch(e){
        res.status(401).render('login', {title: "Error", error: e});

    }
});

module.exports = router;