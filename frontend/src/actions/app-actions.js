import Annotations from 'anglue/annotations';

export class AppActions {
    static get annotation() {
        return Annotations.getActions('app', AppActions);
    }

    publishSuccessMessage(title, message) {
        //publish success
        console.log('Success Message: ' + title, message);

        this.dispatch('APP_MESSAGE', {
            title: title,
            message: message
        });
    }

    publishErrorMessage(title, message) {
        //publish error
        console.error('Error: ' + title, message);

        this.dispatch('APP_ERROR', {
            title: title,
            message: message
        });
    }
}

export default AppActions;
