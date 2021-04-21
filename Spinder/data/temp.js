try { //Try to get user from DB
    let top_artist_arr = user.topArtists; //Get topArtist array

    for (let i = 0; i < 5 && artists.length; i++) { //loop through at most 5 artists, or the length of array if smaller
        /**--------------------------------ADD/UPDATE ARTIST IN THE DB---------------------------------- */
        try { //Try to get the artist from the DB, if it is already there, then we do not need to add it again,
            const artist = await artistData.getArtistById(artists[i].id); //instead just add the user_id to the user_ids array
            let user_id_arr = artist.user_ids; //get the old user_ids array
            user_id_arr.push(user_id); //add the new user to this array
            let updatedArtist = {
                _id: artists[i].id,
                user_ids: user_id_arr,
                spotify_id: artists[i].id,
                spotify_url: artists[i].href,
                name: artists[i].name,
                img: artists[i].images[0]
            }
            try {
                await artistData.updateArtist(artist._id, updatedArtist);
            } catch (e) {
                //artist was unable to be updated
                console.log(e);
            }

        } catch (e) { //Artist is not in the DB, thus we must add it completely
            let user_id_arr = new Array();
            user_id_arr.push(user_id);
            let artist = {
                _id: artists[i].id,
                user_ids: user_id_arr,
                spotify_id: artists[i].id,
                spotify_url: artists[i].href,
                name: artists[i].name,
                img: artists[i].images[0]
            }
            try {
                await artistData.addArtist(artist);
            } catch (e) {
                //artist was unable to be added
                console.log(e);
            }
        }
        /**---------------------------------------------------------------------------------------------------- */
        top_artist_arr.push(artist[i].name); //push the artist into the top artist array
    } //Out of for loop
    user.topArtists = top_artist_arr; //update the user's top artist
    try {
        await userData.updateUser(user._id, user);
    } catch (e) { //unable to update the user
        console.log(e);
    }
} catch (e) { //User was not found in the DB with that ID
    console.log(e);
}