const express = require('express');
const router = express.Router();
const data = require('../data');
const artistData = data.artists;
const schemas = require('../data/schemas');

router.get('/', async (req, res) => {
    try{
        const artistList = await artistData.getAllArtists();
        res.status(200).json(artistList);
    }
    catch(e){
        res.status(500).send({error:e});
    }
});

router.get('/:id', async (req, res) => {
    try{
        const artist = await artistData.getArtistById(req.params.id);
        res.status(200).json(artist);
    }
    catch(e){
        res.status(500).send({error:e});
    }
});

router.post('/', async (req, res) => {
    const updatedData = req.body;
    const result=schemas.artistSchema.validate(updatedData);
    if(result.error){
        res.status(400).json({error:result.error});
        return;
    }
    let newArtist=result.value;
    try {
        const addedArtist = await bookData.addArtist(newArtist);
        res.status(200).json(addedArtist);
    }
    catch(e){
        res.status(500).send({error: e});
    }
});


router.put('/:id', async(req, res)=> {
    const updatedData = req.body;
    const result=schemas.artistSchema.validate(updatedData);
    if(result.error){
        res.status(400).json({error:result.error});
        return;
    }
    let updatedInfo=result.value;
    try{
        await artistData.getArtistById(req.params.id);
    }
    catch(e){
        res.status(404).json({ error: 'Artist not found' });
        return;
    }
    try {
        const updatedArtist = await artistData.updateArtist(req.params.id, updatedInfo);
        res.status(200).json(updatedArtist);
    }
    catch(e){
        res.status(500).send({error: e});
    }
});

router.patch('/:id', async (req, res) => {
    try{
        await artistData.getArtistById(req.params.id);
    }
    catch(e){
        res.status(404).json({ error: 'Artist not found' });
        return;
    }
    const updatedData = req.body;
    const result=schemas.artistSchema.validate(updatedData);
    if(result.error){
        res.status(400).json({error:result.error});
        return;
    }
    let oldArtist = await artistData.getArtistById(req.params.id);
    let updatedInfo=result.value;
    let updatedData = {};
    if(updatedInfo.spotify_id && updatedInfo.spotify_id != oldArtist.spotify_id){
        updatedData.spotify_id = updatedInfo.spotify_id;
    }
    if(updatedInfo.spotify_url && updatedInfo.spotify_url != oldArtist.spotify_url){
        updatedData.spotify_url = updatedInfo.spotify_url;
    }
    if(updatedInfo.name && updatedInfo.name != oldArtist.name){
        updatedData.name = updatedInfo.name;
    }
    if(updatedInfo.img && updatedInfo.img != oldArtist.img){
        updatedData.img = updatedInfo.img;
    }
    if(updatedInfo.user_ids){
        for (id of updatedInfo.user_ids){
            if (oldArtist.user_ids.includes(id)===false){
                updatedData.user_ids = updatedInfo.user_ids;
                break;
            }
        }
    }
    if (Object.keys(updatedData).length <1){
        res.status(400).json({error: 'Must update at least 1 field'});
        return;
    }
    try{
        const updatedArtist = await artistData.updateArtist(req.params.id, updatedData);
        res.status(200).json(updatedArtist);
    }
    catch(e){
        res.status(400).send({error:e});
    }
});

router.delete('/:id', async (req, res) => {
    try{
        await artistData.getById(req.params.id);
    }
    catch(e){
        res.status(404).json({ error: 'Artist not found' });
        return;
    }
    try {
      const deletedArtist = await artistData.removeArtist(req.params.id);
      res.status(200).json(deletedArtist);
    } catch (e) {
        res.status(500).send({error: e});
    }
});

module.exports = router;