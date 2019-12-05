# AZrecipE
### By Alban Xhaferllari


## About AZrecipE

Tired of google searching recipes and scrolling through multiple websites to find recipes you like, then aggregating the ingredients so you can buy them all at once?


Well no there is AZrecipE. Input your meal preferences (and any food intolerances) and AZrecipE will give you a list of 7 recipes along with ingredients all in one click. As you try each recipe, don't forget to rate it. AZrecipe will use this to provide you with meal selections just for you.

There is 4 easy steps:
- Sign up using google.
- Select your dietary preferences.
- Get your recipes.
- Cook and Rate.

Page link: https://azrecipe.herokuapp.com/

## Technonolgies
- HTML
- CSS, Bootstrap heavy
- NodeJS, Mongoose, Express, Passport
- MongoDB
- APIs, OAuths, Full CRUD

## Programming logic overview
User only has access to homepage until signing up with google. 
After sign-up all pages on the app become available.
User is prompted to get new recipes. This page has a form for user to select criteria.

Once filled and sent, the criteria is saved in the user model property 'searches'.
NOTE: searches is an array with its own subschema. The goal is to save the search preferences everytime the user changes the preferences. This will keep count and update the offset in each search instance. Currently, only first field is searches gets filled on user's first recipe call and all subsequent recipe calls will use this criteria.

Spoonacular API is called using the user input criteria. Spooncaular responds with 1-10 recipes (limiting this to 1 because of limits on spoonacular calls to API). Received recipes are converted into format for MongoDB model and saved. User maintains reference to recipes in the currRecipes field. As more recipe calls are made by the user, currRecipes references move to oldRecipes field and so on.

User can access dashboard for a list of all ingredients so they can do their shopping.


#### Additionals

On recipe show page, there is ingredients, instructions, and details. User also uses this page to rate the recipe 1-5 stars. Rating is full CRUD. Other users' ratings are also displayed.

The user rating (along with spoonacular rating) will be used to build a model for the user to recommend better recipes.


