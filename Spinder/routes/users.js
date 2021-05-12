const e = require('express');
const express = require('express');
const router = express.Router();
const data = require('../data');
const songData = data.songs;
const artistData = data.artists;
const userData = data.users;
const profileData = data.profiles;
const schemas = require('../data/schemas');
const xss = require('xss');

//checks if there are any new items in newArray
function containsNew(originalArray, newArray){
    for (x of newArray){
        if (originalArray.includes(x)===false){
            return true;
        }
    }
    return false;
}

//route for liking a user
router.post('/:id/like', async (req,res)=>{
    let userBeingLiked = await userData.getUserById(xss(req.params.id));
    let userThatLiked = await userData.getUserById(req.session.user);
    
    let likedProfiles = userThatLiked.likedProfiles;
    let alreadyLiked = false;
    for(let profile of likedProfiles){
        if(profile == req.params.id){
            alreadyLiked = true;
            break;
        }
    }
    if(!alreadyLiked){
        likedProfiles.push(userBeingLiked._id);
    }

    let updatedUserData = {
        likedProfiles: likedProfiles
    }
    try{
        const newUser = await userData.updateUser(req.session.user,updatedUserData);
        res.redirect('/users/');
    }catch(e){
        console.log(e);
        res.json({error: e.message});
    }


});

//route for unliking a user

router.post('/:id/unlike', async (req,res)=>{
    let userBeingUnliked = await userData.getUserById(xss(req.params.id));
    let userThatUnliked = await userData.getUserById(req.session.user);
    
    let likedProfiles = userThatUnliked.likedProfiles;
    for(i = 0; i < likedProfiles.length; i++){
        if(likedProfiles[i] === userBeingUnliked._id){
            likedProfiles.splice(i,1);
            break;
        }
    }

    let updatedUserData = {
        likedProfiles: likedProfiles
    }
    try{
        const newUser = await userData.updateUser(req.session.user,updatedUserData);
        res.redirect('/users/');
    }catch(e){
        console.log(e);
        res.json({error: e.message});
    }

});
  
  
//route for updating user id
router.post('/settings/:id', async (req,res)=> {
    let {firstName, lastName, bio, country, city, isPrivate, showSongs, showArtists, showPlaylists}= req.body;
    let oldUser = await userData.getUserById(xss(req.params.id));
    //Check to see what was updated
    if(!firstName || firstName == ""){
        firstName = oldUser.firstName;
    }
    if(!lastName || lastName == ""){
        lastName = oldUser.lastName;
    }
    if(!bio || bio == ""){
        if(!oldUser.bio){
            bio = "";
        }
        else{
            bio = oldUser.bio;
        }
    }
    if(!country || country == ""){
        country = oldUser.location.country;
    }
    if(!city || city == ""){
        city = oldUser.location.city;
    }
    if(isPrivate == undefined){
        if(oldUser.visibility && oldUser.visibility.isPrivate == undefined){
            isPrivate = false;
        }
        else{
            if(!oldUser.visibility){
                isPrivate = false;
            }
            else{
                isPrivate = oldUser.visibility.isPrivate;
            }
        }
    }
    if(showSongs == undefined){
        if(oldUser.visibility && oldUser.visibility.showSongs == undefined){
            showSongs = true;
        }
        else{
            showSongs = false;
        }
    }
    if(showArtists == undefined){
        if(oldUser.visibility && oldUser.visibility.showArtists == undefined){
            showArtists = true;
        }
        else{
            showArtists = false;
        }
    }
    if(showPlaylists == undefined){
        if(oldUser.visibility && oldUser.visibility.showPlaylists == undefined){
            showPlaylists = true;
        }
        else{
            showPlaylists = false;
        }
    }

    let updatedUser = {
        firstName: firstName,
        lastName: lastName,
        location: {
            country: country,
            city: city
        },
        bio: bio,
        visibility: {
            isPrivate: isPrivate,
            showSongs: showSongs,
            showArtists: showArtists,
            showPlaylists: showPlaylists
        }
    }   
    try{
        const user = await userData.updateUser(xss(req.params.id), updatedUser);
        res.redirect('/users/'+xss(req.params.id));
    }catch(e){
        console.log(e); 
        res.json({error: e.message});
    }
});

router.get('/settings', async (req,res)=>{ 
    try{
        const curr_user = await userData.getUserById(req.session.user);
        let visibility = {
            isPrivate: false,
            showSongs: true,
            showPlaylists: true,
            showArtists: true
        };
        if(curr_user.visibility){
            //Check for undefined fields and set default values
            if(curr_user.visibility.isPrivate === undefined){
                visibility.isPrivate = false;
            }
            else{
                visibility.isPrivate = curr_user.visibility.isPrivate;
            }//artist
            if(curr_user.visibility.showArtists === undefined){
                visibility.showArtists = true;
            }
            else{
                visibility.showArtists = curr_user.visibility.showArtists;
            }//songs
            if(curr_user.visibility.showSongs === undefined){
                visibility.showSongs = true;
            }
            else{
                visibility.showSongs = curr_user.visibility.showSongs;
            }//playlists
            if(curr_user.visibility.showPlaylists === undefined){
                visibility.showPlaylists = true;
            }
            else{
                visibility.showPlaylists = curr_user.visibility.showPlaylists;
            }
        }
        else{
            curr_user.visibility = visibility;
        }
        res.render('settings',{curr_user: curr_user,  _id: req.session.user, isLoggedIn: true, visibility: visibility});
    }catch(e){
        console.log(e);
        res.json({error: e.message});
    }
  });

router.get('/', async (req, res) => {
    try{
        const userList = await userData.getAllUsers();
        const curr_user = await userData.getUserById(req.session.user);
        res.status(200).render('users', {curr_user: curr_user, title: "Users", users : userList, isLoggedIn: true, partial: 'userSingle'});
    }
    catch(e){
        console.log(e);
        res.status(500).send({error:e});
    }
});

// If viewing our own profile, show all attributes. Otherwise, toggle something
router.get('/:id', async (req, res) => {
    // console.log(req.session);
    try{
        const user = await userData.getUserById(req.params.id);
        const curr_user = await userData.getUserById(req.session.user);
        //console.log(user);
        let musicalProfile = undefined;
        if (user.musicalProfile)
            musicalProfile = await profileData.getProfileById(user.musicalProfile);
        //console.log(musicalProfile);
        res.render('profile',{curr_user: curr_user, user : user, musicalProfile: musicalProfile, isLoggedIn: true});
        //res.status(200).json(user);
    }
    catch(e){
        console.log(e);
        res.status(404).render('error', {status:'404', error:e.message, redirect:'users', redirectText:'All Users'});
    }
});

router.get('/:id/update', async (req, res) => {
    // console.log(req.session);
    if (req.params.id == req.session.user) {
        try{
            await userData.loadUserSpotifyData(req.session.user);
            res.redirect('/users/' + xss(req.params.id));
            //res.status(200).json(user);
        }
        catch(e){
            console.log(e);
            res.status(500).send({error:e.message});
        }
    } else {
        res.redirect("/users");
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
    console.log("why here")
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
    try {
        // dont check for deletion count in case user is not connected to spotify
        const deletedProfile = await profileData.removeProfileByUserId(req.params.id);
        const artistDeletion = await artistData.removeUserFromArtists(req.params.id);
        const songDeletion = await songData.removeUserFromSongs(req.params.id);
        const deletedUser = await userData.removeUser(req.params.id);
        
        return res.status(200).send({result: 'redirect', url:'/logout'});
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