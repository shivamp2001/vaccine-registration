exports.createUser=async (req,res)=>{
    try{
        const reqBody=req.body
       if(!isValidRequestBody(req.body)) return res.status(400).json({status:false,message:"requesbody must be present"})
        let{fname,lname,phone,email,password,address}=req.body
      
        if(!fname) return res.status(400).json({status:false,message:"fname must be present"})
        if (!isValidName(fname)) { return res.status(400).send({ status: false, message: 'Please enter fname' }) }
        if(!lname) return res.status(400).json({status:false,message:"lname must be present"})
        if (!isValidName(lname)) { return res.status(400).send({ status: false, message: 'lname should be in alphabets' }) }
        if(!address) return res.status(400).json({status:false,message:"address must be present"})
    
        reqBody.address=JSON.parse(address)
        // -------email validation------
        if(!email) return res.status(400).json({status:false,message:"email must be present"})
        if(!isValidEmail(email)) return res.status(400).json({status:true,message:"please provide valid email"})
        const checkemail=await userModel.findOne({email:email})
        if(checkemail) return res.status(400).json({status:false,message:"email is already present in db"})

        // -------phone validation------
        if(!phone) return res.status(400).json({status:false,message:"phone must be present"})
        if(!isValidphone(phone)) return res.status(400).json({status:false,message:"please provide valid indian phone number"})
        const checkphone=await userModel.findOne({phone:phone})
        if(checkphone) return res.status(400).json({status:false,message:"phone number is already present in db"})
        if(!password) return res.status(400).json({status:false,message:"password must be present"})
        if(!isValidpassword(password)) return res.status(400).send({status:false,message:"Please provide valid password"})
        
        // -------create aws-s3 link------
        let files= req.files
        if(files && files.length>0){     
        reqBody.profileImage= await aws.uploadFile( files[0] )
        }
        else{
            res.status(400).send({ message: "profileimage must be present" })
        } 
        reqBody.password=await bcrypt.hash(password,10)
        
      if(!address) return res.status(400).send({status:false,message:"address is required"})
       address=JSON.parse(address)
        //let {shipping,billing}=newaddress
        
        if (!address.shipping.street) return res.status(400).send({ status: false, message: "Enter Shipping Address." })
        if(!address.shipping.street) return res.status(400).send({status:false,message:"shipping street is required"})
        if (!isValidBody(address.shipping.street)) { return res.status(400).send({ status: false, message: 'Please enter Shipping street' }) }

        // if (!isValidCityc(shipping.city)) { return res.status(400).send({ status: false, message: 'Please enter Shipping city' }) }
        if(!address.shipping.city) return res.status(400).send({status:false,message:"shipping city is required"})
        if (!isValidCity(address.shipping.city)) { return res.status(400).send({ status: false, message: 'Invalid Shipping city' }) }
       
        // if (!isValidBody(shipping.pincode)) { return res.status(400).send({ status: false, message: 'Please enter Shipping pin' }) }
        if (!isValidPinCode(address.shipping.pincode)|| isNaN(address.shipping.pincode)) { return res.status(400).send({ status: false, message: 'Invalid Shipping Pin Code.' }) }
        if(!address.shipping.pincode) return res.status(400).send({status:false,message:"shipping pincode is required"})

        if (!address.billing) return res.status(400).send({ status: false, message: "please enter billing" })

        if (!isValidBody(address.billing.street)) { return res.status(400).send({ status: false, message: 'Please enter billing street' }) }
        if(!address.billing.street) return res.status(400).send({status:false,message:"billing street is required"})

        if(!address.billing.city) return res.status(400).send({status:false,message:"billing city is required"})
        if (!isValidBody(address.billing.city)) { return res.status(400).send({ status: false, message: 'Please enter billing city' }) }
        if (!isValidCity(address.billing.city)) { return res.status(400).send({ status: false, message: 'Invalid billing city' }) }

        if(!address.billing.pincode) return res.status(400).send({status:false,message:"billing pincode is required"})
        if (!isValidBody(address.billing.pincode)) { return res.status(400).send({ status: false, message: 'Please enter billing pin' }) }
        if (!isValidPinCode(address.billing.pincode)|| isNaN(address.billing.pincode)) { return res.status(400).send({ status: false, message: 'Invalid billing Pin Code.' }) }

        //-------create aws-s3 link------
       
        
        const createdata=await userModel.create(reqBody)
       return res.status(201).json({status:true,message:'User created successfully',data:createdata})
    }catch(error){
        return res.status(500).json({status:false,message:error.message})
    }
}

// -------login-user------
exports.userLogin = async function(req,res){
  try{   let body = req.body
      let {email,password}= body
      if(!email) return res.status(400).send({status:false,message:"email is required"})
      if(!isValidEmail(email)) return res.status(400).send({status:false,message:"please provide valid email"})
      if(!password)return res.status(400).send({status:false,message:"password is required"})
      if(!isValidpassword(password))return res.status(400).send({status:false,message:"please provide valid password"})
      let checkEmail = await userModel.findOne({email :email})
      if(!checkEmail) return res.status(404).send({status:false,message:"email is not reg."})
      let checkPassword = await bcrypt.compare(password,checkEmail.password)
      if(!checkPassword) return res.status(400).send({status:false,message:"Password is not correct"})
      else{
          const token = jwt.sign({userId:checkEmail._id},"Group-13")
          let obj = {
              userId:checkEmail._id,
              token : token
          }
          return res.status(200).send({status:true,message: "User login successfull",data:obj})
      }}catch(err){
      return res.status(500).json({status:false,message:err.message})
  }}