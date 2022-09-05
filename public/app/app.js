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

function setProductInfo(curIndex, type) {
    //variable "type" determine what list to choose from
    PRODUCTINFO = [];
    if (type == 1) { //game
        $.getJSON("data/game_list.json", function(items) {
            $.each(items.GAME_LIST, function(index, item) {
                if (index == curIndex) {
                    PRODUCTINFO.push({
                        tempIndex: index,
                        type: type,
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
                        tempIndex: index,
                        type: type,
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
            if (item.type == 1) {
                $("#infocontent").append(`
                <div class="itemblock">
                    <img class="image" src="${item.image}"/>
                    <div class="content">
                        <h3>${item.name}</h3>
                        <p>The game's console: ${item.console}</p>
                        <p>${item.developer}</p>
                        <p>${item.rating}</p>
                        <p>${item.year}</p>
                        <h4>$${item.price}</h4>
                        <p>${item.stock}</p>
                    </div>
                    <a href="#/buynow" class="buynow" onclick="addToCart(${item.tempIndex}, ${item.type})">Add to Cart</a>
                </div>
                `);
            }
            if (item.type == 2) {
                $("#infocontent").append(`
                <div class="itemblock">
                    <img class="image" src="${item.image}"/>
                    <div class="content">
                        <h3>${item.name}</h3>
                        <p>The type of hardware:${item.type}</p>
                        <p>${item.developer}</p>
                        <h4>$${item.price}</h4>
                        <p>${item.stock}</p>
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

function initListeners() {
    $(window).on("hashchange", route);
    route();
}

$(document).ready(function() {
    //navToPage("home");
    //initFirebase();
    addModalListener();
    initListeners();
});