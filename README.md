# koinok_frontend

Basically the project is based on given assignment. In this project I tried to fullfill all the frontend requirement of the assigment.

AngularJS is used to develop the frontend.

In this project basically user can create their account in the portal and can genearte the ether wallet in the system. 
Two factor authentication is added with google authenticator. 

# Installation Steps

Install pm2 globally 

npm install pm2 -g

Clone the repo 

git clone https://github.com/ankitm27/koinok_frontend.git


Installation command

move into the folder

run npm install(It will install all the dependency) 

Create the .env file as .sampleenv which has all your environment variable stored. Give the value of all parmater 
according to your configuration.      

For running frontend server run pm2 start server(pm2 is node process manager)

now we can access the front-end server at 8080 port

For testing frontend server is running hit the http://ip:8080/#!/ and it will open the home page

Nginx proxy is used to deployed the app through which you can access the app via port 80. 

Deployed Link - http://13.127.212.216/#!/





