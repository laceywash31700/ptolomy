# Ptolemy

Ptolemy is my attempt at making a  VTT for my-self it started as a challenge set up by my mentor but as I moved forward I began to get hyper focused on adding features. 

I used firebase for the a cloud native back-end. and Im using websocket for emitting information to other clients browsers. 

because I didn't want anyone who uses it to have there data leaked I opted to have the firebase configuration put in a env. If you want to run the Ptolemy locally you would need to make your own firebase config. the instructions on how to do that using the docs from the [firebase website](https://firebase.google.com/docs/web/setup). 

Firebase features used:

1) [firestore](https://firebase.google.com/docs/firestore/quickstart) 
2) [firebase Auth](https://firebase.google.com/docs/auth/where-to-start)
3) [Cloud Storage](https://firebase.google.com/docs/storage/web/start)

If you not interested in testing my app yourself take a look at this [video](https://youtu.be/QCyPBRAV1sM) that showcases it's features.