var loggedIn = false;

var scrollCount = 2;
var scrollDistance = 0;

var CURINDEX = 0;
var PRODUCTINFO = [];
var CART = [];

///////////Page Navigation Code Start!

function route() {
    let hashTag = window.location.hash;
    let pageID = hashTag.replace("#/", "");
    
    if(!pageID) {
        navToPage("home");
    } else if (pageID == "keyword_search") { //search button
        searchQuery();
        navToPage("search"); 
    } else if (pageID == "cart") {
        loadCart();
        navToPage("cart");
    } else if (pageID == "loginfire") { //login buttons
        loginfire();
        navToPage("login"); 
    } else if (pageID == "signupfire") {
        createUser();
        navToPage("login");
    } else if (pageID == "signoutfire") {
        signOut();
        navToPage("login");
    } else if (pageID == "buynow") {
        //addToCart(); onclick happens first then this...
        navToPage("cart");
        if (loggedIn) {
            updateModal("cart");
        } else {
            updateModal("errorlogin");
        }
    } else if (pageID == "emptycart") {
        navToPage("cart");
        updateModal("dumpcart");
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

        loadCart();
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

function addToCart(curIndex, type) {
    if (loggedIn == true) {
        if (type == 1) {
            $.getJSON("data/game_list.json", function(items) {
                $.each(items.GAME_LIST, function(index, item) {
                    if (index == curIndex) {
                        CART.push({
                            image: item.image,
                            name: item.name,
                            console: item.console,
                            developer: item.developer,
                            rating: item.rating,
                            year: item.year,
                            price: item.price,
                            stock: item.stock
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
        }
        if (type == 2) {
            $.getJSON("data/hardware_list.json", function(items) {
                $.each(items.HARDWARE_LIST, function(index, item) {
                    if (index == curIndex) {
                        CART.push({
                            image: item.image,
                            name: item.name,
                            developer: item.developer,
                            price: item.price,
                            stock: item.stock
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
        }
    } else {
        console.log("not logged in");
    }
}

function loadCart() { 
    $("#cartitem").empty();
        if (loggedIn == false) {
            $("#cartitem").append(`
            <h1>You are not logged in!</h1>
            `);
        }
        else if (CART.length == 0) {
            $("#cartitem").append(`
            <h1>No items in shopping Cart</h1>
            `);
        } else {
            $.each(CART, function(index, item) {
                $("#cartitem").append(`
                <div class="cartblock">
                <img class="image" src="${item.image}"/>
                <div class="content">
                    <h3>${item.name}</h3>
                    <h4>$${item.developer}</h4>
                    <h4>$${item.price}</h4>
                    <a href="#/cart" class="remove" onclick="emptyCartItem(${index})">Remove from Cart</a>
                </div>
                </div>
            `);
        });
        }
}

function emptyCart() {
    CART = [];
    console.log(CART);
    navToPage("cart");
}

function emptyCartItem(curIndex) {
    CART.splice(curIndex, 1);
    console.log(CART);
    navToPage("cart");
}

///////Cart Code End!


function setProductInfo(curIndex, curType) {
    //variable "type" determine what list to choose from
    PRODUCTINFO = [];
    if (curType == 1) { //game
        $.getJSON("data/game_list.json", function(items) {
            $.each(items.GAME_LIST, function(index, item) {
                if (index == curIndex) {
                    PRODUCTINFO.push({
                        tempIndex: index,
                        type: curType,
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
    } else if (curType == 2) { //hardware
        $.getJSON("data/hardware_list.json", function(items) {
            $.each(items.HARDWARE_LIST, function(index, item) {
                if (index == curIndex) {
                    PRODUCTINFO.push({
                        tempIndex: index,
                        type: curType,
                        image: item.image,
                        name: item.name,
                        product_type: item.product_type,
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
            if (item.type == 1) {
                $("#infocontent").append(`
                <div class="itemblock">
                    <img class="image_g" src="${item.image}"/>
                    <div class="content">
                        <h3>${item.name}</h3>
                        <p>The game's console: ${item.console}</p>
                        <p>${item.developer}</p>
                        <p>${item.rating}</p>
                        <p>${item.year}</p>
                        <h4>$${item.price}</h4>
                        <p>Number in Stock: ${item.stock}</p>
                    </div>
                    <a href="#/buynow" class="buynow" onclick="addToCart(${item.tempIndex}, ${item.type})">Add to Cart</a>
                </div>
                `);
            }
            if (item.type == 2) {
                $("#infocontent").append(`
                <div class="itemblock">
                    <img class="image_h" src="${item.image}"/>
                    <div class="content">
                        <h3>${item.name}</h3>
                        <p>The type of hardware:${item.product_type}</p>
                        <p>${item.developer}</p>
                        <h4>$${item.price}</h4>
                        <p>Number in Stock: ${item.stock}</p>
                    </div>
                    <a href="#/buynow" class="buynow" onclick="addToCart(${item.tempIndex}, ${item.type})">Add to Cart</a>
                </div>
                `);
            }
            
        });
}

function loadScrollbarGames() {
    $("#scroll_items_game").empty();
    $.getJSON("data/game_list.json", function(items) {
        $.each(items.GAME_LIST, function(index, item) {
            //if (index < scrollCount) {                                      //////If statement to limit number in scroll bar
            $("#scroll_items_game").append(`
            <div class="scroll_item">
                <img class="image" src="${item.image}" />
                <h3>${item.name}</h3>
                <p>$${item.price}</p>
            </div>
            `);
            //}
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
            if (index < scrollCount) {
            $("#scroll_items_hardware").append(`
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

/////////Modal Start!
function updateModal(modal_code) {
    $("#modal").empty();
    if (modal_code == "login") {
        $("#modal").append(`
        <div class="modalblock">
            <h1>Log In</h1>
            <p>You are now logged in!</p>
        </div>
        `);
    } else if (modal_code == "signout") {
        $("#modal").append(`
        <div class="modalblock">
            <h1>Sign Out</h1>
            <p>You are now signed out!</p>
        </div>
        `);
    } else if (modal_code == "cart") {
        $("#modal").append(`
        <div class="modalblock">
            <h1>Cart</h1>
            <p>Item added to Cart!</p>
        </div>
        `);
    } else if (modal_code == "dumpcart") {
        $("#modal").append(`
        <div class="modalblock">
            <h1>Cart</h1>
            <p>Cart has been emptied!</p>
        </div>
        `);
    } else if (modal_code == "errorlogin") {
        $("#modal").append(`
        <div class="modalblock">
            <h1>Please Log In</h1>
            <p>You are not logged in!</p>
        </div>
        `);
    } else {
        $("#modal").append(`
        <div class="modalblock">
            <h1>Notice</h1>
            <p>There is a Modal Error</p>
        </div>
        `);
    }
    $('#modal').css("display", "block");
}

function addModalListener() {
    $("#app").click(function(e){
        $('#modal').css("display", "none");
    });
}
/////////////Modal End!


/////Search Code Start!

function searchQuery() {
    let query = $("#keyword_search").val();
        $("#keyword_search").val("");
        query = query.toLowerCase(); 

        let emptyQueryCheck = 0; //not implemented correctly yet

        $("#search_results").empty();
        if (query != "") {
            $.getJSON("data/game_list.json", function(items) {
                $.each(items.GAME_LIST, function(index, item) {
                    let lc_name = item.name.toLowerCase();
                    let lc_console = item.console.toLowerCase();
                    let lc_developer = item.developer.toLowerCase();
                    if (lc_name.includes(query) || lc_console.includes(query) || lc_developer.includes(query)) {
                        $("#search_results").append(`
                        <div class="itemblock">
                            <img class="image_g" src="../${item.image}"/>
                            <div class="content">
                                <h3>${item.name}</h3>
                                <div class="saleblock"><p>${item.developer}</p></div>
                                <h4>$${item.price}</h4>
                            </div>
                            <a href="#/productinfo" class="getinfo" onclick="setProductInfo(${index},1)">INFO</a>
                        </div>
                        `);
                    } else {
                        emptyQueryCheck++;
                    }
                });
            })
            .fail(function(jqxhr, textStatus, error) {
                console.log(jqxhr);
                console.log(textStatus);
                console.log(error);
            });
            $.getJSON("data/hardware_list.json", function(items) {
                $.each(items.HARDWARE_LIST, function(index, item) {
                    let lc_name = item.name.toLowerCase();
                    let lc_product_type = item.product_type.toLowerCase();
                    let lc_developer = item.developer.toLowerCase();
                    if (lc_name.includes(query) || lc_product_type.includes(query) || lc_developer.includes(query)) {
                        $("#search_results").append(`
                        <div class="itemblock">
                            <img class="image_h" src="../${item.image}"/>
                            <div class="content">
                                <h3>${item.name}</h3>
                                <div class="saleblock"><p>${item.developer}</p></div>
                                <h4>$${item.price}</h4>
                            </div>
                            <a href="#/productinfo" class="getinfo" onclick="setProductInfo(${index},2)">INFO</a>
                        </div>
                        `);
                    }
                    else {
                        emptyQueryCheck++;
                    }
                });
            })
            .fail(function(jqxhr, textStatus, error) {
                console.log(jqxhr);
                console.log(textStatus);
                console.log(error);
            });
        } else {
            $("#search_results").append(`
                <h1>Search query cannot be blank!</h1>
            `);
        }
}

/////////Search Code End!


/////Animations Start!

const smallDevice = window.matchMedia("(min-width: 768px)");

var changeExecuted = 0;
var doChangeUpdate = false;

function handleDeviceChange(e) {
    if (e.matches) {
        scrollCount = 4; 
    } else {
        scrollCount = 2;
    }
    
}



/////Animations End!




function initListeners() {
    $(window).on("hashchange", route);
    route();

    $(document).on('click','#search_button', function() {
        searchQuery();
    });

    $(document).on('click','#left_button_g', function() {
        scrollDistance -= 200;
        if (scrollDistance < 0) {
            scrollDistance = 1000;
        }
        console.log(scrollDistance);
        document.getElementById('scroll_items_game').scrollTo({
            left: scrollDistance,
            behavior: 'smooth'
         });
    });
    $(document).on('click','#right_button_g', function() {
        scrollDistance += 500;
        if (scrollDistance > 1000) {
            scrollDistance = 0;
        }
        console.log(scrollDistance);
        document.getElementById('scroll_items_game').scrollTo({
            left: scrollDistance,
            behavior: 'smooth'
         });
    });
    $(document).on('click','#left_button_h', function() {
        
    });
    $(document).on('click','#right_button_h', function() {
        
    });

    /*
    $(window).resize(function() {
        handleDeviceChange(smallDevice);
        loadScrollbarGames();
    });
*/
}

$(document).ready(function() {
    //navToPage("home");
    //initFirebase();
    addModalListener();
    initListeners();

    //handleDeviceChange(smallDevice);
});