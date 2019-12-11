/*global $*/

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
    // quotes.forEach( function(i, quote){
        $(".js-heroes-container").append(heroes);
    // });
}


/* Event Listeners */
$(document).on("click", ".js-select-hero", function(){
    let heroID = $(this).attr("id");
    selectHero(heroID);
});

$(".js-search-btn").on("click", function(e){
    e.preventDefault();
    searchHeroes();
});