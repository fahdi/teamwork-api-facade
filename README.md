# Teamwork to Bigquery

The project helps taking a team's teamwork data to the big query where it can be used for any purpose. For example, the data can be used for creating dashboards in datastudio.

You should have the following installed already

1. redis 
2. node
3. yarn
4. nodemon `npm install -g nodemon`
5. Google authentication
	
	If you are not running this app on Google Compute Engine, which might be the case, you need a Google Developers service account.
	* Visit the Google Developers Console.
	* Create a new project or click on an existing project.
	* Activate the slide-out navigation tray and select API Manager. From here, you will enable the APIs that your application requires. Read details at [this link] (https://googlecloudplatform.github.io/google-cloud-node/#/docs/bigquery/0.9.6/guides/authentication )

# Setup 

* Clone this repo 
* run `redis-server`
* run `mongod` or whatever method you use to run it. I use `Robo 3T` to stay connected to my local mongodb. To setup a different mongodb than default, create an update a config/development.json file and you can setup the database as follows:

	```
	{
	  database: {
	    host: 'localhost:27017',
	    name: 'teamworkdata'    
	  }
	  // other settings can go here
	}  
	```  
	> Change connection settings accordingly. 

* Update `config/development.json` as follow

	```
	  teamwork: {
	    company: "YOUR COMPANY",
	    apikey: "YOUR_API_KEY"
	  }
	```
	In the above example, your company would be `recurship` and the API key would be avilable in your teamwork account settings. 

	You can generate an API Key from the My Profile section. 
		
	* Click your profile avatar from the lower left-hand pane
	* Select My Profile > select API Keys from the upper left-hand pane.

	From here, you can access a previously generated API Key or choose to Generate New API Key.
	
* Get google auth JSON key. Read details at [this link] (https://googlecloudplatform.github.io/google-cloud-node/#/docs/bigquery/0.9.6/guides/authentication) and then update `config/development.json` as follows

	```
	gcp: {
    	projectId: 'teamwork-173902',
    	keyFilename: './config/teamwork-4dfe70ab5a4a.json'   
  	} 	
	```

	`teamwork-4dfe70ab5a4a.json` in this case, is my key file located in the `config` directory
	
*  Run `yarn` to install all required packages.
*  Run `yarn dev` to run with all the debugging enabled.

### Contact

info@fahdmurtaza.com for any questions.
	


