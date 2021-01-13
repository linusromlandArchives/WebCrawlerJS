# WebCrawler

Easy web crawler that's **indexing the web**. WebCrawler is written in NodeJS and is saving all the links to a MongoDB Database. 


# How it works

WebCrawler starts up and by default connects to MongoDB on 127.0.0.1 (localhost) without authentication. This could however be turned on. (Check Authentication MongoDB). It then starts crawling the web from the start URL. (Default is: https://www.romland.space/) The start URL could be changed. (Check Start Commands) It then saves all links it finds on the webpage and then moves on to the next not visited site.  WebCrawler could run in the background using for example Screen on linux.

# Usage

The **WebCrawler** is very easy to use. 

You need to have NodeJS, npm and MongoDB installed on your system.
<br> https://nodejs.org/en/download/ 
<br> https://www.npmjs.com/get-npm
<br> https://www.mongodb.com/try/download/community?tck=docs_server

You download the project by git clone or downloading the zip. 
Then you go to the server folder and run:

> npm install 

This will install all the dependencies the project is using.
Then you run:
> node app.js 

Here you could also specify startup commands. (Check Start Commands)



# Startup Commands

You could set two options on startup when running WebCrawler.
These two are the amount of links you want and your start URL.

### Set number of Links (CURRENTLY BROKEN)
To specify how many links you want. Just type the number after the start command like this
> node app.js 1000

This will create 1000 new links. The default will create 200.
### Set Start URL
To specify your Start URL you need to specify the number of links you want before. 
Then you could just type:
> node app.js 1000 https://google.com/

This will make the Start URL google.com.


# MongoDB Authentication

By default **WebCrawler** does not use authentication to MongoDB

If you have your MongoDB Database with authentication turned on you could use that with WebCrawler.
To do this copy the file named **mongoauth.json.example** and name it **mongoauth.json** and then specify your credentials in the file


<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

