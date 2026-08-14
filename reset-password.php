<?php

?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Reset Password</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
</head>
<body class="bg-light">

<div class="container d-flex justify-content-center align-items-center vh-100">
  <div class="card p-4 shadow" style="max-width:500px;width:100%;">
    <h4 class="text-center mb-3">Reset Password</h4>

    <div id="loading" class="text-center text-secondary mb-3">
      Validating your token...
    </div>

    <div id="tokenInvalid" class="alert alert-danger d-none">
      Invalid or expired token. Please request a new password reset link.
    </div>

    <form id="resetForm" class="d-none">
      <div class="mb-3">
        <label class="form-label">New Password</label>
        <input type="password" id="password" class="form-control" required>
      </div>
      <div class="mb-3">
        <label class="form-label">Confirm Password</label>
        <input type="password" id="confirmPassword" class="form-control" required>
      </div>
      <button type="submit" class="btn btn-primary w-100">Reset Password</button>
    </form>

    <div id="successMsg" class="alert alert-success d-none mt-3">
      Password reset successfully! You can now log in.
    </div>
  </div>
</div>

<script>
$(document).ready(function() {
  // Get token from URL: ?token=abcd123
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  // Simulate AJAX token validation
  $.ajax({
    url: 'validate-token.php',
    method: 'POST',
    data: { token },
    dataType: 'json',
    success: function(response) {
      $('#loading').hide();
      if (response.valid) {
        $('#resetForm').removeClass('d-none');
      } else {
        $('#tokenInvalid').removeClass('d-none');
      }
    },
    error: function() {
      $('#loading').hide();
      $('#tokenInvalid').removeClass('d-none').text('Error validating token.');
    }
  });

  // Handle password reset
  $('#resetForm').on('submit', function(e) {
    e.preventDefault();
    const password = $('#password').val().trim();
    const confirm = $('#confirmPassword').val().trim();

    if (password !== confirm) {
      alert('Passwords do not match.');
      return;
    }

    $.ajax({
      url: 'update-password.php',
      method: 'POST',
      data: { token, password },
      dataType: 'json',
      success: function(response) {
        if (response.valid) {
          $('#resetForm').hide();
          $('#successMsg').removeClass('d-none');
        } else {
          alert(response.message || 'Error resetting password.');
        }
      }
    });
  });
});
</script>

</body>
</html>
