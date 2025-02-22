# This is a telex integration app

 # Titile
     Emsil counting app

 # Description

 This app count the number of mail you receive each day and send you the total number of mail received once it's 8:pm each day.

 # Gitbub URL

 "https://github.com/benjamin2orie/Email-counting"


 # Instructions on how to run it locally:

 1. clone the repo
    # git clone https://github.com/benjamin2orie/Email-counting
    # cd Email-counting
    # code . // This command open the VsCode editor on any commad envrironment
  2. Start the server
      # node index.js


      # Endpoint
      ## Description:
         This return the telex integration json file
        # URL: https://email-counting.onrender.com/integrationJson
        ## METHOD: GET 
        ## status_code:200 

        # Responses format

        {
            "data":{
                "date":{
                    "created_at": "2025-02-18",
                    "updated_at": "2025-02-22"  
                },
                "description":{
                     "app_description":"An email counting app the count the number of mails you received each day and send you the response once it's 8:pm",
                   "app_logo": "https://images.pexels.com/photos/30460366/pexels-photo-30460366/free-photo-of-relaxed-cat-on-a-sunlit-stone-in-istanbul-park.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1.",
                   "app_name": "email counting.",
                   "app_url": "https://github.com/benjamin2orie/Email-counting",
                    "background_color": "#HEXCODE"
                }
            }
        }

  


