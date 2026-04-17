
	<!-- Forgot Password Modal -->
	<div class="modal fade" id="forgotPasswordModal" tabindex="-1" aria-labelledby="forgotPasswordLabel" aria-hidden="true">
	  <div class="modal-dialog modal-dialog-centered">
		<div class="modal-content border-0 shadow">
		  <div class="modal-header bg-primary text-white">
			<h5 class="modal-title" id="forgotPasswordLabel">Reset Password</h5>
			<button type="button" class="close" data-dismiss="modal" aria-label="Close">
				<span aria-hidden="true">×</span>
			</button>
		  </div>

		  <div class="modal-body">
			<p class="small text-muted mb-3">
			  Enter your registered email address and we’ll send you a password reset link.
			</p>

			<form id="forgotForm">
			  <div class="mb-3">
				<label class="form-label">Email address</label>
				<input type="email" id="forgotEmail" class="form-control" placeholder="you@example.com" required>
			  </div>

			  <button type="submit" class="btn btn-primary w-100">Send Reset Link</button>
			</form>

			<div id="forgotSuccess" class="alert alert-success mt-3 d-none">
			  ✅ Reset link sent! Please check your email.
			</div>

			<div id="forgotError" class="alert alert-danger mt-3 d-none">
			  ❌ Email not found. Please try again.
			</div>
		  </div>
		</div>
	  </div>
	</div>
	<span style="display:none;">
	<button class=" forgotPasswordModalButton btn btn-link" data-bs-toggle="modal" data-bs-target="#forgotPasswordModal">
	  Forgot Password?
	</button>
	</span>
	
	<style>
	.error-message {
	  color: red;
	  margin-top: 10px;
	}
	</style>
	
	<script>
		$('#forgotForm').on('submit', function(e) {
			e.preventDefault();

			const email = $('#forgotEmail').val().trim();
			$('#forgotSuccess, #forgotError').addClass('d-none');

			$.ajax({
			  url: 'validate-token.php',
			  method: 'POST',
			  data: { email: email },
			  dataType: 'json',
			  beforeSend: function() {
				$('#forgotForm button').prop('disabled', true).text('Sending...');
			  },
			  success: function(response) {
				if (response.valid) {
				  $('#forgotForm')[0].reset();
				  $('#forgotSuccess').removeClass('d-none');
				  setTimeout(function (){  $('#forgotPasswordModal').modal('hide'); }, 1000);
				} else {
				  $('#forgotError').removeClass('d-none').text(response.message || 'Email not found.');
				}
			  },
			  error: function() {
				$('#forgotError').removeClass('d-none').text('Something went wrong. Please try again.');
			  },
			  complete: function() {
				$('#forgotForm button').prop('disabled', false).text('Send Reset Link');
			  }
			});
		  });
		  
	</script>