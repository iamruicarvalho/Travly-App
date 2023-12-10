$(function() {
    var selectedUserId;
 
    function initializeAutocomplete() {
        $("#userSearch").autocomplete({
            source: function(request, response) {
                $.ajax({
                    url: "/user/search",
                    method: "GET",
                    data: { term: request.term },
                    success: function (data) {
                        var usernames = data.map(function (user) {
                            return { label: user.username, value: user.username, id: user.id };
                        });
                        response(usernames);
                    }
                });
            },
            minLength: 1,
            select: function(event, ui) {
                console.log("ui.item:", ui.item); 
                selectedUserId = ui.item.id; 
                console.log("Selected user ID:", selectedUserId);
            }
        });
    }
 
    initializeAutocomplete();
 
    $("#addUserBtn").click(function() {
        var groupId = getGroupIdFromUrl();
        if (selectedUserId && groupId) {
            // Fetch CSRF token from meta tags
            var csrfToken = $('meta[name="csrf-token"]').attr('content');
 
            $.ajax({
                url: "/groups/" + groupId + "/details/add-user/" + selectedUserId,
                method: "POST",
                data: {
                    userId: selectedUserId,
                    _token: csrfToken
                },
                success: function(response) {
                    console.log("Server response:", response);
                
                    if (response.user && response.user.username) {
                        console.log("User added to the group successfully");
                
                        // Update the user list on the client side
                        updateUserList(response.user);
                    } else {
                        console.error("Invalid server response. Missing user information.");
                    }
                },
                error: function(error) {
                    console.error("Error adding user to the group:", error);
                }
            });
        } else {
            console.warn("No user selected. Please select a user before adding to the group.");
        }
    });
 
    function getGroupIdFromUrl() {
        var path = window.location.pathname;
        var regex = /\/groups\/(\d+)\/details/;
        var match = path.match(regex);
 
        if (match && match[1]) {
            return match[1];
        } else {
            console.error("Unable to extract groupId from the URL.");
            return null;
        }
    }

    function updateUserList(user) {
        // Assuming #users is the container for the user list
        let userList = $("#users");

        // Append the new user to the user list
        userList.append('<li id="user">' + user.username + '</li>');

        // Check if the current user has the permission to remove users
        
            // Append the remove link
            userList.append('<a href="/groups/' + user.groupId + '/remove-user/' + user.id + '">Remove</a>');
        
    }

    $(document).ready(function() {
        // Assuming you have a variable to store the CSRF token
        var csrfToken = $('meta[name="csrf-token"]').attr('content');
    
        // Event listener for the "Leave Group" link
        $(document).on('click', '.leave-group', function() {
            // Get the group ID from the data attribute
            var groupid = $(this).data('group-id');
    
            // Confirm with the user before leaving the group
            var confirmLeave = confirm("Are you sure you want to leave the group?");
            
            if (confirmLeave) {
                // Send an AJAX request to leave the group
                $.ajax({
                    url: '/groups/leave',
                    method: 'POST',
                    data: {
                        groupid: groupid,
                        _token: csrfToken
                    },
                    success: function(response) {
                        console.log("Left group successfully:", response);
    
                        // Handle UI updates or redirection after leaving the group
                        // For example, you can reload the page
                        location.reload();
                    },
                    error: function(error) {
                        console.error("Error leaving group:", error);
    
                        // Handle errors or show a user-friendly message
                        alert("An error occurred while leaving the group. Please try again.");
                    }
                });
            }
        });
    });
 });
 