// Welcome to the tutorial!
import { createServer, hasMany, belongsTo, RestSerializer, Factory,  Model } from 'miragejs'

export default function () {
    createServer({
        // serializers help you the kinds of transforms that are commonly applied to Apis.
        serializers: {
            reminder: RestSerializer.extend({
                include: ["list"],
                embed: true, 
                // dft is side-loaded. json with two children; reminder x list returned.
                // embed format is below 3,4th; api expects included resources to be embedded.
                // reminders : Array(5)
                // 3 : {text: 'Do taxes', id: '4', list: {…}}
                // 4 : {text: 'Visit bank', id: '5', list: {…}}
            }),
        },
        // help you simplify process of seeding mserver with realistic and relational data.
        models: {
            list: Model.extend({
                reminder: hasMany(),
            }),
            reminder: Model.extend({
                list: belongsTo(),
            }),
        },
        factories: {
            // List Factory.
            list: Factory.extend({
                name(i) {
                    return `List ${i}`;
                },
                //afterCreate hook.
                afterCreate(list, server) {
                    // check if newly created list already has reminders passed into it.i hacked solution by looking console.
                    if (!list.reminder.models.length > 1) {
                        server.createList('reminder', 1, { list })
                    }
                }
            }),
            reminder: Factory.extend({
                // text: "Reminder text", // comes out with too generic text "".
                text(i) {
                    return `Reminder ${i}`
                }
            }),
        },

        seeds(server) {
            server.create("reminder", { text: "Walk the dog" })
            server.create("reminder", { text: "Take out the trash" })
            // c a reminder by factory with autoincrement-id.
            server.create("reminder");
            // c two reminder by factory with autoincrement-id.
            server.createList("reminder", 2)
            
            // server.create("list", { name: "Home" });
            // server.create("list", { name: "Work" });
            
            // c a new list with a reminder that has text in it. listid-1&-2, list-0&-1.
            let homeList = server.create("list", { name: "Home" });  
            // as soon as list created, aftercreate makes a reminder with increased next-id.
            // Do taxes override specific properties that defined in Factory.
            server.create("reminder", { list: homeList, text: "Do taxes" });
            let workList = server.create("list", { name: "Work" });
            server.create("reminder", { list: workList, text: "Visit bank" });
            
            // c a new list with 2 reminders in it. listid-3, list-2.
            // aftercreat takes effect.
            // total 3 reminders with new list-name-home even if previous-home exists.
            server.create("list", {
                name: "Home",
                reminder: server.createList("reminder", 2),
            });
        },

        routes() {
            this.get("api/reminders", (schema) => {
                return schema.reminders.all()
            })

            this.post("/api/reminders", (schema, request) => {
                let attrs = JSON.parse(request.requestBody)
                console.log(attrs)
                return schema.reminders.create(attrs)
            })

            this.delete("/api/reminders/:segmentName", (schema, request) => {
                let id = request.params.segmentName
                return schema.reminders.find(id).destroy()
            })

            this.get("/api/lists", (schema, request) => {
                return schema.lists.all()
            })
            
            this.get("/api/lists/:segmentName/reminders", (schema, request) => {
                let listId = request.params.segmentName
                let list = schema.lists.find(listId)
                console.log(list)
                console.log(list.reminders)
                return list.reminders
            })
        }
    })
}