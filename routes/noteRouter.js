const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const Note = require('../models/note');

const validateYouTubeUrl = url => {
  if (url != undefined || url != '') {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[2].length == 11) {
      // Do anything for being valid
      // if need to change the url to embed url then use below line
      return true;
    } else {
      // Do anything for not being valid
      return false;
    }
  }
};

const saveNote = async (note, res) => {
  try {
    const savedNote = await note.save();
    res.json(savedNote);
  } catch {
    res.status(500).json({ error: err.message });
  }
};

// get request to get notes for a particular user
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ author: req.username });
    res.json(notes);
  } catch (err) {
    res.json({ msg: 'Could Not find notes for that user.' });
  }
});

// get request to get a particular for a particular user
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    res.json(note);
  } catch (err) {
    res.json({ msg: 'Could Not find notes for that user.' });
  }
});

// create a note for a user.
router.post('/', auth, async (req, res) => {
  try {
    const { title, body, videoLink, videoTimestamp } = req.body;
    if (!title || !videoLink)
      return res.status(400).json({ msg: 'Not all fields have been entered.' });
    if (!validateYouTubeUrl(videoLink))
      return res.status(400).json({ msg: 'Please enter a valid YouTube url.' });

    let note = new Note({
      title,
      body,
      author: req.username,
      videoLink,
      videoTimestamp,
    });
    saveNote(note, res);
  } catch (err) {
    res.json({ msg: 'Hello' });
    console.log(err);
  }
});

// update a note
router.patch('/:id', auth, async (req, res) => {
  try {
    const { title, body, videoLink, videoTimestamp } = req.body;
    let note = await Note.findById(req.params.id);
    if (title) note.title = title;
    if (body) note.body = body;
    if (videoLink) note.videoLink = videoLink;
    if (videoTimestamp) note.videoTimestamp = videoTimestamp;
    saveNote(note, res);
  } catch (err) {
    console.log(err);
    res.json({ error: err });
  }
});

// delete a note
router.delete('/:id', auth, async (req, res) => {
  try {
    let note = await Note.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Note Deleted' });
  } catch (err) {
    res.json({ error: err });
  }
});

module.exports = router;
