
// Access API KEY
const CONST_API_KEY = "?api_key=6e76d8e64273bbf9d64689eda72d9885";

// The Top Rate, Popular and Upcoming Movie API LINK Prefix
const CONST_TOP_RATE_LINK_PREFIX = "https://api.themoviedb.org/3/movie/top_rated";
const CONST_POPULAR_LINK_PREFIX = "https://api.themoviedb.org/3/movie/popular";
const CONST_UPCOMING_LINK_PREFIX = "https://api.themoviedb.org/3/movie/upcoming";

// Extract Movie Genre Id with Name API LINK PREFIX
const CONST_GENRE_LINK_PREFIX = "https://api.themoviedb.org/3/genre/movie/list"

// Derived Movie Poster LINK PREFIX
const CONST_MOVIE_POSTER_LINK_PREFIX = "https://image.tmdb.org/t/p/w500/";

// Get the HTML Display Obj
const CONST_DROP_DOWN_BUTTON_ID         = "drop-down-Button";
const CONST_DROP_DOWN_MENU_ID           = "drop-down-menu";
const CONST_MOVIE_LIST_SCROLL_ID        = "movie-list-scroll";
const drop_down_button_dom              = document.getElementById(CONST_DROP_DOWN_BUTTON_ID);
const drop_down_menu_dom                = document.getElementById(CONST_DROP_DOWN_MENU_ID);
const drop_down_menu_ul_dom             = drop_down_menu_dom.querySelector("ul");

const movie_list_scroll_container       = document.getElementById(CONST_MOVIE_LIST_SCROLL_ID);
const movie_list_container              = document.getElementById("movie-list-container");
const movie_list_left_button            = document.getElementById("left-button-display");
const movie_list_right_button           = document.getElementById("right-button-display");

// Define Movie Data JSON KEY Name
const MOVIE_API_DATA_KEY            = "results";
const MOVIE_API_GENRE_ID_LIST_KEY   = "genre_ids";
const MOVIE_API_TITLE_KEY           = "title";
const MOVIE_API_POSTER_PATH_KEY     = "poster_path";
const MOVID_API_RELEASE_DATE_KEY    = "release_date";

// Define Genre Data JSON KEY Name
const GENRE_API_DATA_KEY            = "genres";
const GENRE_API_ID_KEY              = "id";
const GENRE_API_NAME_KEY            = "name";

// Define Selection And API LINK Relation
const DROP_DOWN_TOP_RATE_NAME       = "Top Rate";
const DROP_DOWN_POPULAR_NAME        = "Popular";
const DROP_DOWN_UP_COMING_NAME      = "Up Coming";

const OBJ_CAT_TO_API_LINK = 
{
    [DROP_DOWN_TOP_RATE_NAME] : CONST_TOP_RATE_LINK_PREFIX,
    [DROP_DOWN_POPULAR_NAME] : CONST_POPULAR_LINK_PREFIX,
    [DROP_DOWN_UP_COMING_NAME] : CONST_UPCOMING_LINK_PREFIX
};

const CONST_DISPLAY_MAX_NUM_OF_MOVIE    = 20;

// Set the default selection as "Top Rate"
let curDropDownSelection = DROP_DOWN_TOP_RATE_NAME;


async function getAllGenre() 
{
    genreIdNameObjList = [];
    try 
    {
        const genreData = await fetch(CONST_GENRE_LINK_PREFIX + CONST_API_KEY);
        const genreDataJSON = await genreData.json();
        genreIdToNameList = genreDataJSON[GENRE_API_DATA_KEY];
        console.log(genreIdToNameList);
    } 
    catch (error) 
    {
        console.log("Error Genre API :", error);
    }

    // Return a Promise such that can wait for return
    return new Promise((resolve, reject)=>{
        if (genreIdToNameList.length > 0)
        {
            resolve(genreIdToNameList);
        }
        else
        {
            reject("Fail Retrieve Genre API From Server : " + CONST_GENRE_LINK_PREFIX);
        }
      });
}

async function getAllMovies(movieApiLink) 
{
    const moviesData = await fetch(movieApiLink + CONST_API_KEY);
    const moviesDataJSON = await moviesData.json();

    console.log(moviesDataJSON[MOVIE_API_DATA_KEY]);

    let genreIdNameObjList = [];
    try
    {
        genreIdNameObjList = await getAllGenre();
    }
    catch (error)
    {
        // Already printed inside getAllGenre()
    }

    // If Get Genre ID with Name List API Fail, the list would be empty
    createMovieUI(moviesDataJSON.results, genreIdNameObjList);
}



function createMovieUI(arrMoviesObj, genreIdNameObjList)
{
    let szAllMoviesCard = "";
    for (let index in arrMoviesObj)
    {
        // Just Display At Most 20 From the Data
        if (index > CONST_DISPLAY_MAX_NUM_OF_MOVIE)
        {
            break;
        }
        const movieObj = arrMoviesObj[index];
        szAllMoviesCard += createEachMovieUI(movieObj, genreIdNameObjList);
    }

    movie_list_container.innerHTML = szAllMoviesCard;
}

function createEachMovieUI(dataEachMovie, genreIdNameObjList)
{
    const MAX_OVERVIEW_CHAR = 100;
    const szMovieDescription = dataEachMovie.overview;
    const szTrancatedOverview = szMovieDescription.length > MAX_OVERVIEW_CHAR ? szMovieDescription.substring(0, MAX_OVERVIEW_CHAR) + "..." : szMovieDescription;
    const szReleaseYear = dataEachMovie[MOVID_API_RELEASE_DATE_KEY].split("-")[0];  // The Date Format YYYY-MM-DD

    // Get All the Genre Name from other API
    let listOfGenreName = [];

    // When Extract Genre Data Success to get the corresponding name
    if (genreIdNameObjList)
    {
        for (const id of dataEachMovie[MOVIE_API_GENRE_ID_LIST_KEY])
        {
            // Get if one id can have multiple naming
            const oneIDMatchedNameList = genreIdNameObjList.reduce((accList, obj)=>{
                                            if (obj[GENRE_API_ID_KEY] === id)
                                            {
                                                accList.push(obj[GENRE_API_NAME_KEY]);
                                            }
                                            return accList;
                                        }, []);

            // Expand to One Storage List
            listOfGenreName.push(...oneIDMatchedNameList);
        }

        // Cast to Set then cast back to remove the duplicates if necessary
        listOfGenreName = [...(new Set(listOfGenreName))];
    }

    // w-72 h-80 max-w-xs
    const eachMovieUI = 
    `
        <div class="inline-block px-3">
            <div class="w-72 h-fit overflow-hidden select-none rounded-t-xl shadow-md shadow-zinc-500 bg-gray-200 hover:shadow-2xl transition-shadow duration-300 ease-in-out">
                <img class="w-full pointer-events-none rounded-lg" src=${CONST_MOVIE_POSTER_LINK_PREFIX + dataEachMovie[MOVIE_API_POSTER_PATH_KEY]} alt="${dataEachMovie[MOVIE_API_TITLE_KEY]}">
            </div>
            <div class="w-72 h-fit overflow-hidden rounded-b-xl shadow-md shadow-zinc-500 bg-gray-200 hover:shadow-2xl hover:opacity-100 transition-shadow duration-300 ease-in-out opacity-85">
                <div class="font-bold font-mono text-xl text-center my-2">${dataEachMovie[MOVIE_API_TITLE_KEY]}</div>
                <div class="font-normal text-stone-900 text-lg text-center mb-0">( ${szReleaseYear} )</div>
                <div class="font-normal text-gray-700 text-lg text-justify m-4">${szTrancatedOverview}</div>

                <div class="flex flex-wrap items-center justify-center">
                    ${listOfGenreName?.length ? createGenreChips(listOfGenreName) : ""}
                </div>

            </div>
        </div>
    `;

    return eachMovieUI;
}

function createGenreChips(genreNameList) 
{
    const chipHTMLGenreList = genreNameList.map((genreName) => {
      return `<span class="inline-block bg-gray-300 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">${genreName}</span>`;
    });
  
    return chipHTMLGenreList.join("");
}

function CreateDropDownMenuItems()
{
    let szDropDownListItem = "";

    for (const key in OBJ_CAT_TO_API_LINK)
    {
        szDropDownListItem +=
        `
        <li>
            <a href="#" class="block px-4 py-2 text-lg hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">${key}</a>
        </li>
        `;
    }

    drop_down_menu_ul_dom.innerHTML = szDropDownListItem;
}

function domObjectCheckToHideAndDisplay(obj, bIsToHide)
{
    if (obj.classList.contains("hidden"))
    {
        if (!bIsToHide)
        {
            obj.classList.remove("hidden");
        }
    }
    else
    {
        if (bIsToHide)
        {
            obj.classList.add("hidden");
        }
    }
}


////////////////////////////////////////////////////////////// Implementations

// 1 - Create the Movie Category Into Drop Down List
CreateDropDownMenuItems();

// 2 - Setup Drop Down Button and Menu Manipulate Behaviour
// Setup Drop Down Button Listener
// Click to Toggle Drop Down Menu
drop_down_button_dom.addEventListener("click", (event)=>{
    
    // If original hidden, remove to display
    bIsNowHide = drop_down_menu_dom.classList.contains("hidden");

    domObjectCheckToHideAndDisplay(drop_down_menu_dom, !bIsNowHide);
    
});

// Use check timout duration method 
// Check If Mouse Out both of Button and Menu
// in ms
const CONST_MOUSE_OUT_TOLERANCE_IN_MS = 100;
let itimeOutId;

function HandleWhenMouseOverButtonOrMenu(event)
{
    clearTimeout(itimeOutId);
}

function HandleWhenMouseOutButtonOrMenu(event)
{
    itimeOutId = setTimeout(()=>{

        domObjectCheckToHideAndDisplay(drop_down_menu_dom, true);

    }, CONST_MOUSE_OUT_TOLERANCE_IN_MS);
}

// Add Listener to check if Mouse not over both the button and the menu
drop_down_button_dom.addEventListener("mouseout", HandleWhenMouseOutButtonOrMenu);
drop_down_menu_dom.addEventListener("mouseout", HandleWhenMouseOutButtonOrMenu);
drop_down_button_dom.addEventListener("mouseover", HandleWhenMouseOverButtonOrMenu);
drop_down_menu_dom.addEventListener("mouseover", HandleWhenMouseOverButtonOrMenu);



// 3 - Setup Drop Down Menu Item Action Behaviour
const listLiDomInDropDownMenu = drop_down_menu_ul_dom.getElementsByTagName("li"); 

for (const li of listLiDomInDropDownMenu)
{
    li.addEventListener("click", (event)=>{

        const szMovieCategory = event.target.textContent;

        // Check if Category Key valid
        if (szMovieCategory in OBJ_CAT_TO_API_LINK)
        {
            // Call to display corresponding movie type
            curDropDownSelection = szMovieCategory;
            getAllMovies(OBJ_CAT_TO_API_LINK[curDropDownSelection]);

            // Update the Button Display Content to the Selected Category
            drop_down_button_dom.innerHTML = `${curDropDownSelection}<svg class="w-5 h-2.5 ms-6"  aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 1 10 6">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
                                                </svg>`;
        }
    });
}


// 4 - Set Mouse Over the Movie Container Can Drag to See the Overflow Movie Card
//     Set Mouse Over the Movie Container Auto Display Left Right Arrow Button
//     Set Mouse Down hide button and allow drag
let bIsMouseHoldInMovieList = false;
let dragStartX = -1;
let scrollX;

movie_list_scroll_container.addEventListener("mousedown", (event)=>{
    bIsMouseHoldInMovieList = true;
    dragStartX = event.clientX;
    scrollX = movie_list_scroll_container.scrollLeft;

    domObjectCheckToHideAndDisplay(movie_list_left_button, true);
    domObjectCheckToHideAndDisplay(movie_list_right_button, true);
});

movie_list_scroll_container.addEventListener("mouseup", (event)=>{
    bIsMouseHoldInMovieList = false;
    dragStartX = -1;
});

movie_list_scroll_container.addEventListener("mousemove", (event)=>{
    // Only If hold to action
    if (bIsMouseHoldInMovieList && dragStartX != -1)
    {
        movie_list_scroll_container.scrollLeft = scrollX - (event.clientX - dragStartX);
    }

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    movie_list_left_button.style.top = `${mouseY}px`;
    movie_list_left_button.style.left = `${mouseX - 50}px`;
    movie_list_right_button.style.top = `${mouseY}px`;
    movie_list_right_button.style.left = `${mouseX + 50}px`;
});

movie_list_scroll_container.addEventListener("mouseover", (event)=>{

    domObjectCheckToHideAndDisplay(movie_list_left_button, false);
    domObjectCheckToHideAndDisplay(movie_list_right_button, false);

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    movie_list_left_button.style.top = `${mouseY}px`;
    movie_list_left_button.style.left = `${mouseX - 50}px`;
    movie_list_right_button.style.top = `${mouseY}px`;
    movie_list_right_button.style.left = `${mouseX + 50}px`;
});

movie_list_scroll_container.addEventListener("mouseout", (event)=>{
    domObjectCheckToHideAndDisplay(movie_list_left_button, true);
    domObjectCheckToHideAndDisplay(movie_list_right_button, true);
});


// 5 - Default First Run Call to Display the "Top Rate" Movie
getAllMovies(OBJ_CAT_TO_API_LINK[curDropDownSelection]);