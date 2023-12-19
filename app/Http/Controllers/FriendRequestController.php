<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Redirect;
use App\Models\FriendRequest;
use App\Models\User;
use App\Models\Follow;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FriendRequestController extends Controller{

    public function acceptFriendRequest(Request $request) {
        
        if (Auth::check()) {
            
            $this->validate($request, [
                 'notifType' => 'required', 
                 'to' => 'required|exists:user_,id',
                 'targetPost' => 'exists:post_,postid',
            ]);

            $userid = Auth::user()->id;

            $this->createFriends($userid, $request->input('to')); //Make me follow target and target follow me
            $notifCheck = app('App\Http\Controllers\NotificationController')->addNotif($request); //send notification accepting friend request
            
            return redirect()->back(); //redirect()->action('notifications');
        }

        //redirect to error page (still none) with error user not logged in
        return redirect()->action('home');
    }

    public function sendFriendRequest(Request $request){
        if (Auth::check()) {

            $this->validate($request, [
                'notifType' => 'required', 
                'to' => 'required|exists:user_,id',
                'targetPost' => 'exists:post_,postid',
            ]);
            
            $notifType = $request->input('notifType');

            $friendRequest = new Request();
            $friendRequest->createRequest(Auth::user()->id, $request->input('to')); //Create new friend request

            $check = Request::where('senderid', $request->input('to'))->where('receiverid', Auth::user()->id)->exists(); //check if other person already sent request
            
            if($check){ //if they did, make them friends and change notif to accepted_follow
                createFriends(Auth::user()->id, $request->input('to'));
                $notifType = 'accepted_follow';
                $notifCheck = addNotif($request); //can be used to check if notification was created
                return redirect()->back();
            } 

            $notifCheck = addNotif($request); //can be used to check if notification was created

            return Redirect::back();
        }
        
        //redirect to error page (still none) with error user not logged in
        return "Not logged in";
    }

    public function createFriends($friend1, $friend2){
        $friend1 = User::where('id', $friend1)->first();

        $friend1->followers()->attach($friend2);
        $friend1->following()->attach($friend2);
    }
}