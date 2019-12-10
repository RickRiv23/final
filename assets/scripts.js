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
          $("#heroName").html(result[0].name);
          $("#group").html(result[0].group);
          $("#heroImg").attr("src", result[0].imageURL);
          $('#heroModal').show();
          
        }

    });//ajax
}

function searchHeroes(){
    let keyword = $("#searchTerm").val() ? $("#searchTerm").val() : "";
    let category = $("#searchCategory").val() ? $("#searchCategory").val() : "";
    let gender = $("#searchGender").val() ? $("#searchGender").val() : "";
    let author = $("#searchAuthor").val() ? $("#searchAuthor").val() : "";
    $.ajax({
        method: "GET",
        url: "/ajax/searchHero",
        dataType: "json",
        data:{
            "searchTerm": keyword,
            "category": category,
            "gender": gender,
            "authorId": author
        },
        success: function(data){
            // alert(JSON.stringify(data));
            $(".js-quotes").html("");       //  Clear quotes
            if(data != ""){
                let quotes = buildQuotes(data);
                printQuotes(quotes);
            }
            else
                $(".js-quotes").html("<p>No Quotes Found</p>");
        }
    });
}

function buildQuotes(quotes){
    let createdQuotes = [];
    
    for(let i = 0; i < quotes.length; i++){
        createdQuotes[i] = `
            <div class="quote-wrapper">
                <i>${quotes[i].quote}"</i> <br>
                <a href="#" class="js-select-quote" id="${quotes[i].authorId}">-${quotes[i].firstName} ${quotes[i].lastName} </a>
            </div>
            <br><br>
        `;
    }
    
    return createdQuotes;
}

function printQuotes(quotes){
    // quotes.forEach( function(i, quote){
        $(".js-quotes").append(quotes);
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