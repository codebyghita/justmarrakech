<?php
$u = App\Models\User::first();
$u->password = bcrypt('password');
$u->save();
echo "PASSWORD_RESET_SUCCESS\n";
