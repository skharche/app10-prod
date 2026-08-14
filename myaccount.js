function getLoggedInUserDetails(id)
{
	$.ajax({
		method: "POST",
		url: "controllers/userController.php",
		data: { param : "getLoggedInUserDetails", user_id: window.loggedInUserId}
	})
	.done(function( data ) {
		data = $.parseJSON( data );
		
		$("#avatarCircle").html("<img src='"+adminBaseUrl+""+data.data.profile_pic+"' />");
		$("#avatarName").html(data.data.firstname+" "+data.data.lastname);
		$("#name").val(data.data.firstname+" "+data.data.lastname);
		$("#avatarUsername").html(data.data.username);
		$("#email").val(data.data.email);
		$("#phone_number").val(data.data.phone_number);
		$("#username").val(data.data.username);
		$("#user_type").val(data.data.user_type);
		
	});
	$("#myAccountModal").show();
}
async function saveMyAccount() {
  const saveBtn = document.querySelector('.mac-btn-save');
  saveBtn.textContent = 'Saving…';
  saveBtn.disabled = true;

  const formData = new FormData();
  formData.append('param',        'updateAccount');
  formData.append('idtuser',      loggedInUserId);        // your existing session var
  formData.append('email',        document.getElementById('email').value.trim());
  formData.append('phone_number', document.getElementById('phone_number').value.trim());
  formData.append('admin_url', window.adminBaseUrl);

  const imageFile = document.getElementById('image').files[0];
  if (imageFile) {
    formData.append('image', imageFile);
  }

  try {
    const response = await fetch('controllers/userController.php', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
	
    if (result.status === 'success') {
      //showToast(result.message, 'success');
      if (result.data?.profile_image) {
        const avatar = document.getElementById('avatarCircle');
        avatar.innerHTML = `<img src="${result.data.profile_image}"
          style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
      }
      //closeMyAccountModal();
    } else {
      //showToast(result.message || 'Something went wrong.', 'error');
    }

  } catch (err) {
    console.error('Save account error:', err);
    //showToast('Network error. Please try again.', 'error');
  } finally {
    saveBtn.textContent = 'Save Changes';
    saveBtn.disabled = false;
  }
}

// Live preview when user picks a file
if(typeof document.getElementById('image') != "undefined")
document.getElementById('image').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        setAvatarImage(e.target.result);
    };
    reader.readAsDataURL(file);
});

// After successful save, use the server path
function setAvatarImage(src) {
    const avatar = document.getElementById('avatarCircle');
    // Clear initials text, inject img tag
    avatar.innerHTML = `<img src="${src}" alt="Profile photo">`;
}

// Fallback — if image fails to load, show initials again
document.getElementById('avatarCircle').addEventListener('error', function (e) {
    if (e.target.tagName === 'IMG') {
        const avatar = document.getElementById('avatarCircle');
        avatar.innerHTML = getInitials(); // your existing initials helper
    }
}, true);