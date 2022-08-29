var loggedIn = false;

var CURINDEX = 0;
var PRODUCTINFO = [];
var CART = [];

///////////Page Navigation Code Start!

function route() {
    let hashTag = window.location.hash;
    let pageID = hashTag.replace("#/", "");
    
    if(!pageID) {
        navToPage("home");
    } else if (pageID == "loginfire") { //login buttons
        loginfire();
        navToPage("login"); 
    } else if (pageID == "signupfire") {
        createUser();
        navToPage("login");
    } else if (pageID == "signoutfire") {
        signOut();
        navToPage("login");
    }
    else {
        navToPage(pageID);
    }
    //initFirebase();
}

function navToPage(pageName) {
    $.get(`pages/${pageName}/${pageName}.html`, function(data) {
        $("#app").html(data);
        if(loggedIn) {
            //style changes between versions
            $(".navlogin").css("display", "none");
            $(".navsignout").css("display", "block");
            $(".navcart").css("display", "block");
        } else {
            $(".navlogin").css("display", "block");
            $(".navsignout").css("display", "none");
            $(".navcart").css("display", "none");
        }
        
        loadScrollbarGames();
        loadScrollbarHardware();
        loadProductGames();
        loadProductHardware();
        loadProductInfo();
    });
}

///////////Page Navigation Code End!


////////////////////Firebase Code Start!

function initFirebase() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            //user is signed in get information
            console.log("connected");

            firebase.auth().currentUser.updateProfile({
                //displayName: User.fullname,
            })
            .then(() => {
                // Update successful
                //updateSiteWithInfo();  //ADD UPDATE WITH SITE INFO FUNCTION!!!
                loggedIn = true;
            
                //$(".navlogin").css("display", "none");
                //$(".navsignout").css("display", "block"); 

                // ...
              }).catch((error) => {
                // An error occurred
                // ...
            });  
            
        } else {
            console.log("user is not there");
            loggedIn = false;

            //$(".navlogin").css("display", "block");
            //$(".navsignout").css("display", "none");
        }
        //loadCart();
    });
}

function createUser() {
    let password = $("#c_password").val();
    let email = $("#c_email").val();
    let firstname = $("#c_firstname").val();
    let lastname = $("#c_lastname").val();

    firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in 
            var user = userCredential.user;
            console.log(user);
            // ...
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorMessage);
            // ..
        });
}

function loginfire() {
    let password = $("#l_password").val();
    let email = $("#l_email").val();
    
    firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      var user = userCredential.user;
      console.log("signed in");
      loggedIn = true;
      //updateModal("login"); //////////////////////////MODAL
        $(".navlogin").css("display", "none");
        $(".navsignout").css("display", "block");
        $(".navcart").css("display", "block");
      // ...
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorMessage);
    });
}

function signOut() {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        console.log("signed out");
        loggedIn = false;
        //updateModal("signout"); //////////////////////////////MODAL
      }).catch((error) => {
        // An error happened.
        console.log(error);
      });
}

////////////////////Firebase Code End!



function loadCart() { 
    $("#cartitem").empty();
        if (loggedIn == false) {
            $("#cartitem").append(`
            <h1>Y o u &nbsp; a r e &nbsp; n o t &nbsp; L o g g e d &nbsp; I n</h1>
            `);
        }
        else if (CART.length == 0) {
            $("#cartitem").append(`
            <h1>Y o u &nbsp; d o n ' t &nbsp; h a v e &nbsp; a n y &nbsp; i t e m s &nbsp; i n &nbsp; y o u r &nbsp; s h o p p i n g &nbsp; c a r t</h1>
            `);
        }  else {
        $.each(CART, function(index, item) {
            $("#cartitem").append(`
            <div class="cartblock">
            <img class="image" src="${item.image}"/>
            <div class="content">
                <h3>${item.name}</h3>
                <div class="saleblock"><h4>$${item.saleprice}</h4> <p>with Keurig Starter Set</p></div>
                <h4>$${item.price}</h4>
                <h5>★★★★★ ${item.scorereviews} | (${item.totalreviews})</h5>
                <div class="truck"><div class="truck-icon"></div><h5>Free Shipping</h5></div>
            </div>
            </div>
            `);
        });
        }
}

function loadProductGames() {
    $("#product_game").empty();
    $.getJSON("data/game_list.json", function(items) {
        $.each(items.GAME_LIST, function(index, item) {
            $("#product_game").append(`
            <div class="itemblock">
                <img class="image" src="../${item.image}"/>
                <div class="content">
                    <h3>${item.name}</h3>
                    <div class="saleblock"><p>${item.developer}</p></div>
                    <h4>$${item.price}</h4>
                </div>
                <a href="#/productinfo" class="getinfo" onclick="setProductInfo(${index},1)">INFO</a>
            </div>
            `);
        });
    })
    .fail(function(jqxhr, textStatus, error) {
        console.log(jqxhr);
        console.log(textStatus);
        console.log(error);
    });
}

function loadProductHardware() {
    $("#product_hardware").empty();
    $.getJSON("data/hardware_list.json", function(items) {
        $.each(items.HARDWARE_LIST, function(index, item) {
            $("#product_hardware").append(`
            <div class="itemblock">
                <img class="image" src="${item.image}"/>
                <div class="content">
                    <h3>${item.name}</h3>
                    <div class="saleblock"><p>${item.developer}</p></div>
                    <h4>$${item.price}</h4>
                </div>
                <a href="#/productinfo" class="getinfo" onclick="setProductInfo(${index},2)">INFO</a>
            </div>
            `);
        });
    })
    .fail(function(jqxhr, textStatus, error) {
        console.log(jqxhr);
        console.log(textStatus);
        console.log(error);
    });
}

///////Cart Code Start!

function addToCart(curIndex) {
    if (loggedIn == true) {
    $.getJSON("data/data.json", function(items) {
        $.each(items.COFFEE_ITEMS, function(index, item) {
            if (index == curIndex) {
                CART.push({
                    image: item.image,
                    name: item.name,
                    price: item.price,
                    saleprice: item.saleprice,
                    scorereviews: item.scorereviews,
                    totalreviews: item.totalreviews
                });
                console.log(CART);
            }
            
        });
    })
    .fail(function(jqxhr, textStatus, error) {
        console.log(jqxhr);
        console.log(textStatus);
        console.log(error);
    });
    } else {
        console.log("not logged in");
    }
}

function emptyCart() {
    CART = [];
    console.log(CART);
    navToPage("cart");
}

///////Cart Code End!

function setProductInfo(curIndex, type) {
    //variable "type" determine what list to choose from
    PRODUCTINFO = [];
    if (type == 1) { //game
        $.getJSON("data/game_list.json", function(items) {
            $.each(items.GAME_LIST, function(index, item) {
                if (index == curIndex) {
                    PRODUCTINFO.push({
                        image: item.image,
                        name: item.name,
                        console: item.console,
                        developer: item.developer,
                        rating: item.rating,
                        year: item.year,
                        price: item.price,
                        stock: item.stock
                        
                    });
                    console.log(PRODUCTINFO);
                }
            });
        })
        .fail(function(jqxhr, textStatus, error) {
            console.log(jqxhr);
            console.log(textStatus);
            console.log(error);
        });
    } else if (type == 2) { //hardware
        $.getJSON("data/hardware_list.json", function(items) {
            $.each(items.HARDWARE_LIST, function(index, item) {
                if (index == curIndex) {
                    PRODUCTINFO.push({
                        image: item.image,
                        name: item.name,
                        type: item.type,
                        developer: item.developer,
                        price: item.price,
                        stock: item.stock
                    });
                    console.log(PRODUCTINFO);
                }
            });
        })
        .fail(function(jqxhr, textStatus, error) {
            console.log(jqxhr);
            console.log(textStatus);
            console.log(error);
        });
    }
    
}

function loadProductInfo() {
    $("#infocontent").empty();
        $.each(PRODUCTINFO, function(index, item) {
            $("#infocontent").append(`
            <div class="itemblock">
                <img class="image" src="${item.image}"/>
                <div class="content">
                    <h3>${item.name}</h3>
                    <p>The game's console: ${item.console}</p>
                    <p>The type of hardware:${item.type}</p>
                    <p>${item.developer}</p>
                    <p>${item.rating}</p>
                    <p>${item.year}</p>
                    <h4>$${item.price}</h4>
                    <p>${item.stock}</p>
                </div>
                <a href="#/buynow" class="buynow" onclick="addToCart(${index})">Add to Cart</a>
            </div>
            `);
        });
}

function loadScrollbarGames() {
    $("#scroll_items_game").empty();
    $.getJSON("data/game_list.json", function(items) {
        $.each(items.GAME_LIST, function(index, item) {
            if (index < 5) {                                      //////If statement to limit number in scroll bar
            $("#scroll_items_game").append(`
            <div class="scroll_item">
                <img class="image" src="${item.image}" />
                <h3>${item.name}</h3>
                <p>$${item.price}</p>
            </div>
            `);
            }
        });
    })
    .fail(function(jqxhr, textStatus, error) {
        console.log(jqxhr);
        console.log(textStatus);
        console.log(error);
    });
}

function loadScrollbarHardware() {
    $("#scroll_items_hardware").empty();
    $.getJSON("data/hardware_list.json", function(items) {
        $.each(items.HARDWARE_LIST, function(index, item) {
            $("#scroll_items_hardware").append(`
            <div class="scroll_item">
                <img class="image" src="${item.image}" />
                <h3>${item.name}</h3>
                <p>$${item.price}</p>
            </div>
            `);
        });
    })
    .fail(function(jqxhr, textStatus, error) {
        console.log(jqxhr);
        console.log(textStatus);
        console.log(error);
    });
}

function initListeners() {
    $(window).on("hashchange", route);
    route();
}

$(document).ready(function() {
    //navToPage("home");
    //initFirebase();
    initListeners();
});