$(document).ready(function() {
    $("#send-button").click(function() {
        var userInput = $("#user-input").val();
        if (userInput.trim() === "") {
            return;
        }

        $("#chat-box").append('<div class="message user">' + userInput + '</div>');

        // Construct the data to send in the POST request
        var requestData = {
            instruction: "",
            knowledge: "",
            dialog: getDialog()
        };

        // Send the conversation history to the API
        $.ajax({
            type: "POST",
            url: "http://127.0.0.1:5000/get_response",
            data: JSON.stringify(requestData),
            contentType: "application/json",
            success: function(response) {
                var assistantResponse = response.generated_response;
                $("#chat-box").append('<div class="message assistant">' + assistantResponse + '</div>');
            },
            error: function(xhr, status, error) {
                console.log("Error:", error);
            }
        });

        $("#user-input").val("");
    });

    function getDialog() {
        var dialog = [];
        $(".message").each(function() {
            dialog.push($(this).text());
        });
        return dialog;
    }
});
