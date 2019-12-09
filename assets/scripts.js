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
          $("#heroName").html(result[0].firstName + " " + result[0].lastName);
          $("#bio").html(result[0].biography);
          $("#heroImg").attr("src", result[0].portrait);
          $('#heroModal').modal("show");
          
        }

    });//ajax
}

/* Event Listeners */
$(document).on("click", ".js-select-hero", function(){
    let heroID = $(this).attr("id");
    selectHero(heroID);
});