/*global $*/


//  For cart
var cart = [];
const productsEl = $(".products"),
    cartList = $(".shopping-cart-list"),
    productQty = $(".product-quantity"),
    emptyCart = $(".empty-cart-btn"),
    cartCheckout = $(".cart-checkout"),
    totalPrice = $(".total-price");
    
    

/* Functions */
function selectHero(searchID){
    $.ajax({
        method: "GET",
        url: "/ajax/getHero",
        dataType: "json",
        data: { "heroId": searchID},
        success: function(result,status) {
          //alert(result[0].firstName);
          updateModal(result[0]);
        }

    });//ajax
}

function updateModal(hero){
    $("#heroTitle").html(hero.name);
    $("#heroName").html(hero.name);
    $("#gender").html(hero.gender);
    $("#alias").html(hero.alias);
    $("#universe").html(hero.universe);
    $("#group").html(hero.group);
    $("#powers").html(hero.information);
    $("#appearanceIssue").html(hero.comic_appeared);
    $("#appearanceYear").html(hero.year_appeared);
    $("#heroImg").attr("src", hero.imageURL);
    $("#price").html(hero.price);
    
    $(".js-atc").attr("data-hero", hero.heroId);
}

function searchHeroes(){
    let keyword = $("#searchTerm").val() ? $("#searchTerm").val() : "";
    let universe = $("#searchUniverse").val() ? $("#searchUniverse").val() : "";
    let gender = $("#searchGender").val() ? $("#searchGender").val() : "";
    $.ajax({
        method: "GET",
        url: "/ajax/searchHero",
        dataType: "json",
        data:{
            "searchTerm": keyword,
            "universe": universe,
            "gender": gender
        },
        success: function(data){
            // alert(JSON.stringify(data));
            $(".js-heroes-container").html("");       //  Clear quotes
            if(data != ""){
                let heroes = buildCells(data);
                printCells(heroes);
            }
            else
                $(".js-heroes-container").html("<p>No Heroes Found</p>");
        }
    });
}

function buildCells(heroes){
    let createdCells = [];
    
    for(let i = 0; i < heroes.length; i++){
        createdCells[i] = `
            <div class="hero-container js-select-hero" id="${heroes[i].heroId}">
                <figure>
                    <img class="thumbnail-img" src="${heroes[i].imageURL}" alt="Hero Image"/>
                    <figcaption>
                        <p>Hero: ${heroes[i].name}</p>
                        <p>Alias: ${heroes[i].alias}</p>
                        <p>Universe: ${heroes[i].universe}</p>
                        <p>Group: ${heroes[i].group}</p>
                    </figcaption>
                    <br>
                </figure>
            </div>
        `;
    }
    
    return createdCells;
}

function printCells(heroes){
        $(".js-heroes-container").append(heroes);
        
        //  Reinstantiate event listeners
        $(".js-heroes-container").on("click", ".js-search-btn", function(e) {
            e.preventDefault();
            searchHeroes();
        });
}

function add2Cart(heroId){
    $.ajax({
        method: "GET",
        url: "/ajax/getHero",
        dataType: "json",
        data: { "heroId": heroId},
        success: function(data) {
            //   alert(JSON.stringify(data[0]));
            var hero = data[0];
            
            // alert(checkCart(hero.heroId));
            
            if(cart.length === 0 || checkCart(hero.heroId) === undefined) {
                cart.push({product: hero, quantity: 1});
            } else {
                cart.forEach(function(item) {
                    if(item.product.heroId === hero.heroId) {
                        item.quantity++;
                    }
                });
            }
            updateCart();
        }

    });//ajax
}
let checkCart = function(prodId) {
    return cart.find(function(item) {
        return item.product.heroId === prodId;
    });
}

let updateCart = function(){
    $(cartList).html("");
    
    cart.forEach(function(item) {
        let li = document.createElement("li");
        $(li).html(`${item.quantity} ${item.product.alias} - $${item.product.price * item.quantity}`);
        $(cartList).append(li);
    });
    
    $(productQty).html(cart.length);
    
    generateCartButtons();
}

 let generateCartButtons = function(){
    if(cart.length > 0) {
        $(emptyCart).show();
        $(cartCheckout).show();
        $(totalPrice).html(calcTotalPrice() + " Credits");
    } else {
        $(emptyCart).hide();
        $(cartCheckout).hide();
    }
}
 let calcTotalPrice = function(){
    return cart.reduce(function(total, item) {
      return total + (item.product.price *  item.quantity);
    }, 0);
}


/* Event Listeners */
$(document).on("click", ".js-select-hero", function() {
    let heroID = $(this).attr("id");
    selectHero(heroID);
});

$(".js-search-btn").on("click", function(e) {
    e.preventDefault();
    searchHeroes();
});

$(".js-atc").on('click', function() {
    let id = $(this).attr("data-hero");
    add2Cart(id);
});

$(".empty-cart-btn").on("click", function(e) {
    if(confirm("Are you sure?")) {
        cart = [];
    }
    updateCart();
});

$(".js-cart-toggle").on("click", function(){
    $(".shopping-cart").slideToggle();
});