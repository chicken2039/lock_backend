module.exports = (router, Users, passport, rndString) =>{
  router.post('/signup', (req, res) => {
    var params = ['id', 'passwd', 'name'];

    if(check_param(req.body, params)){
      const id = req.body.id;
      const passwd = req.body.passwd;
      const name = req.body.name;

      const new_user = new Users({
        id: id,
        passwd: passwd,
        name: name,
        token: rndString.generate()
      });

      new_user.save((err, data)=>{
        if(err) return res.status(400).send("save err");
        return res.status(200).json(new_user);
      });

    }else{
      return res.status(400).send("param missing or null");
    }
  })

  .post('/signin', (req,res)=>{
    var params = ['id', 'passwd'];
    if(check_param(req.body, params)){
      Users.findOne({id: req.body.id, passwd: req.body.passwd}, {__v:0, _id: 0, passwd: 0}, (err, user)=>{
        if(err) return res.status(500).send("DB err");
        if(user) return res.status(200).json(user);
        else return res.status(404).send("incorrect id or passwd");
      });
    }else return res.status(400).send("param missing or null");
  })

  .get('/auto/:token', (req, res)=>{
     var params = ['token'];

     if(check_param(req.params, params)){
       const token = req.params.token;
       Users.findOne({token: token}, {_id: 0, passwd: 0},(err, user) =>{
         if(err) return res.status(500).send("DB error");
         if(user) return res.status(200).json({id: user.id, name: user.name, token: user.token});
         else return res.status(404).send("user not found");
       });
     }else{
       return res.status(400).send("param missing or null");
     }
  })

  //social auth
  .get('/github/token', passport.authenticate('github-token'), (req, res)=>{
    if (req.user) {
      Users.findOne({github_id: req.user._json.id}, {_id: 0}, (err, users)=>{
        if(err) err;
        if(users) return res.status(200).send(users);
        else{
          github_user = new Users({
            github_id: req.user._json.id,
            name: req.user._json.name,
            token: rndString.generate(),
          });
          github_user.save((err, result)=>{
            if(err) return res.stauts(500).send("DB err");
            if(result) return res.status(200).json(github_user);
          });
        }
      });
    }else res.status(401).send("unauthed");
  })

  .get('/fb/token', passport.authenticate('facebook-token'), (req, res)=>{
    if (req.user) {
      Users.findOne({facebook_id: req.user._json.id}, {_id: 0}, (err, users)=>{
        if(err) err;
        if(users) res.status(200).send(users);
        else{
          facebook_user = new Users({
            facebook_id: req.user._json.id,
            name: req.user._json.name,
            token: rndString.generate(),
          });
          facebook_user.save((err, result)=>{
            if(err) return res.stauts(500).send("DB err");
            if(result) return res.status(200).json(facebook_user);
          });
        }
      });
    } else  res.status(401).send("unauthed");
  })

  .get('/tw/token', passport.authenticate('twitter-token'), (req, res) =>{
    if(req.user) {
      Users.findOne({twitter_id: req.user._json.id}, {_id: 0}, (err, users)=>{
        if(err) err;
        if(users) res.status(200).send(users);
        else{
          twitter_user = new Users({
            twitter_id: req.user._json.id,
            name: req.user._json.name,
            token: rndString.generate(),
          });
          twitter_user.save((err, result)=>{
            if(err) return res.stauts(500).send("DB err");
            if(result) return res.status(200).json(twitter_user);
          });
        }
      });
    } else  res.status(401).send(req.user);
  })


  return router;
}
