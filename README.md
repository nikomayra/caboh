# Caboh: The Game

# Description:
This was my first project after completing the Fullstack Open fullstack coding bootcamp which focused on the MERN stack using REST API structure and CRUD style operations. My friend group used to like playing a card game called Cabo which is based on the game Golf or Cabo with our own extra rules. I felt it was a good game to practice implementing what I learned since the game is turn based and doesn't rely on dynamic "live" elements all players need to see and where websockets would be a better tool.

# Tech Stack
Built using the MERN stack:
### MongoDB, Express, React (using Vite & Javascript), Node.js)
**Frontend:** Built using Vite-React and written in Javascript along with basic html & css for styling.
**Backend:** Built using Node.js and Express for handling API requests, performing game logic calculations and interfacing with the database.
**Database:** Used MongoDB with the Mongoose library for game and user state management.
**Hosting:** Useed Render.com webservice hosting.

# Game Mechanics
The gameplay is similar to the real life card games Golf or Cabo.

## Gameplay:
* Create game, join game and start game. Minimum 2 players to start game. Only player 1 can start game. Game periodically updates, take your time.
* Each player is dealt 4 cards. These cards remain hidden to the player except for 2 initially.
* Draw a card when its your turn (highlights green - bottom). This card is only revealed to you.
* You may perform one of three actions:
  1. Discard this card.
  2. Swap this card with one from your hand.
  3. Use this cards ability.
* Ability cards glow blue, press it to activate and use.
* Once 2 or more rounds have been played any player may then press "Caboh!" before drawing a card, ending their turn.
* A final round is played back to the player who pressed "Caboh!" and a winner is declared.

## Goals:
* The goal is to have the lowest total value hand at the end of the game.
* Aces are 1 point.
* Red Kings are 0 points.
* The rest are standard values.

# Visual examples of gameplay:

## PC:

### Homepage
<img src="https://github.com/user-attachments/assets/a36f9894-cc34-4a9c-88e3-fb2d9a320ca9" width="400"><br>

### Lobby
<img src="https://github.com/user-attachments/assets/ce85b95e-457c-4748-9c20-386f8698b843" width="400">
<img src="https://github.com/user-attachments/assets/af7f5da8-74c4-4df8-8eff-6aff9c025112" width="400"><br>

### Gameplay
<img src="https://github.com/user-attachments/assets/3726eb70-a845-4f7a-bf17-5f39c27ff036" width="400">
<img src="https://github.com/user-attachments/assets/8e05d6bf-0005-417b-91a1-7444bc0a7cf4" width="400">
<br>
<img src="https://github.com/user-attachments/assets/a6c1435d-df71-46dd-8e77-73a43c05bdb8" width="400">
<img src="https://github.com/user-attachments/assets/6b47a23f-a82e-4c88-b1d5-8e0b6cd3d910" width="400">
<br>

### Score Screen
<img src="https://github.com/user-attachments/assets/34660b83-c099-4b88-b84c-8fd767b3b20d" width="400"><br>

### Mobile GUI examples:
<img src="https://github.com/user-attachments/assets/1457ee3b-dd2b-428b-90f9-99e91902cf2b" width="400">
<img src="https://github.com/user-attachments/assets/3cb357f6-a123-4649-a834-e298887a4728" width="400">
<br>

# Areas for future improvements:
* Change framework to use websockets for faster more dynamic gameplay.
* More robust error handling
* More modularity, scalability and reusability following S.O.L.I.D. principles more rigorously.
* CRON jobs for database cleaning
* Better handling of disconnects/reconnects & end game database cleanup


