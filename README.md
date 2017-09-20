## Yopamusic ##
A discord music bot with direct messages commands.

Installation
-------

 1. Install node js (available here : https://nodejs.org/en/)
 2. Clone this repository
 3. Create a file named "config.json" and enter your bot token, your youtube api key, the server where the bot will play music and the         whitelisted users like this :
 
    ```json
    {
      "bot_token": "",
      "server_id": "",
      "yt_api_key": "",
      "users": {
        "user id": "username"
      }
    }
    ```
 4. If you are on windows you will need to install windows build tool. To do this, open a terminal as administrator and run :

    ```sh
    npm install -g windows-build-tools
    ```

 5. In the repository run :

    ```sh
    npm install
    ```

 6. To start the bot, run : 

    ```sh
    node bot.js
    ```

