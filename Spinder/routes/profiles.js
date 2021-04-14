const express = require('express');
const router = express.Router();
const data = require('../data');
const profileData = data.profiles;
const schemas = require('../data/schemas');

router.get('/', async (req, res) => {
    try{
        const profileList = await profileData.getAllProfiles();
        res.status(200).json(profileList);
    }
    catch(e){
        res.status(500).send({error:e});
    }
});

router.get('/:id', async (req, res) => {
    try{
        const profile = await profileData.getProfileById(req.params.id);
        res.status(200).json(profile);
    }
    catch(e){
        res.status(500).send({error:e});
    }
});

router.post('/', async (req, res) => {
    const updatedData = req.body;
    const result=schemas.profileSchema.validate(updatedData);
    if(result.error){
        res.status(400).json({error:result.error});
        return;
    }
    let newProfile=result.value;
    try {
        const addedProfile = await profileData.addProfile(newProfile);
        res.status(200).json(addedProfile);
    }
    catch(e){
        res.status(500).send({error: e});
    }
});

router.put('/:id', async(req, res)=> {
    const updatedData = req.body;
    const result=schemas.profileSchema.validate(updatedData);
    if(result.error){
        res.status(400).json({error:result.error});
        return;
    }
    let updatedInfo=result.value;
    try{
        await profileData.getProfileById(req.params.id);
    }
    catch(e){
        res.status(404).json({ error: 'Profile not found' });
        return;
    }
    try {
        const updatedProfile = await profileData.updateProfile(req.params.id, updatedInfo);
        res.status(200).json(updatedProfile);
    }
    catch(e){
        res.status(500).send({error: e});
    }
});

router.patch('/:id', async (req, res) => {
    try{
        await profileData.getProfileById(req.params.id);
    }
    catch(e){
        res.status(404).json({ error: 'Profile not found' });
        return;
    }
    const updatedBody = req.body;
    const result=schemas.profileSchema.validate(updatedBody);
    if(result.error){
        res.status(400).json({error:result.error});
        return;
    }
    let oldProfile = await profileData.getProfileById(req.params.id);
    let updatedInfo=result.value;
    let updatedData = {};
    if(updatedInfo.user_id && updatedInfo.user_id != oldProfile.user_id){
        updatedData.user_id = updatedInfo.user_id;
    }
    if(updatedInfo.topGenres){
        for (genres of updatedInfo.topGenres){
            if (oldProfile.topGenres.includes(id)===false){
                updatedData.topGenres = updatedInfo.topGenres;
                break;
            }
        }
    }
   if(updatedInfo.averageAudioFeatures){
    let k=Object.keys(updatedInfo.averageAudioFeatures);
    for (key of k){
        if(oldProfile.averageAudioFeatures.key !== updatedInfo.averageAudioFeatures.key){
            updatedData.averageAudioFeatures = updatedInfo.averageAudioFeatures;
            break;
        }
    }
   }
    if (Object.keys(updatedData).length <1){
        res.status(400).json({error: 'Must update at least 1 field'});
        return;
    }
    try{
        const updatedProfile = await profileData.updateProfile(req.params.id, updatedData);
        res.status(200).json(updatedProfile);

    }
    catch(e){
        res.status(400).send({error:e});
    }
});

router.delete('/:id', async (req, res) => {
    try{
        await profileData.getProfileById(req.params.id);
    }
    catch(e){
        res.status(404).json({ error: 'Profile not found' });
        return;
    }
    try {
      const deletedProfile = await profileData.removeProfile(req.params.id);
      res.status(200).json(deletedProfile);
    } catch (e) {
        res.status(500).send({error: e});
    }
});

module.exports = router;