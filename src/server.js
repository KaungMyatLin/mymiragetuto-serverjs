// Welcome to the tutorial!
import { createServer, hasMany, belongsTo, RestSerializer,  Model } from 'miragejs'

export default function () {
    createServer({
        serializers: {
            reminder: RestSerializer.extend({
                include: ["list"],
                embed: false, 
                // dft is side-loaded. json with two children; reminder x list returned.
                // embed format is below 3,4th; api expects included resources to be embedded.
                // reminders : Array(5)
                // 3 : {text: 'Do taxes', id: '4', list: {…}}
                // 4 : {text: 'Visit bank', id: '5', list: {…}}
            }),
        },
        models: {
            list: Model.extend({
                reminder: hasMany(),
            }),
            reminder: Model.extend({
                list: belongsTo(),
            }),
        },

        seeds(server) {
            server.create("reminder", { text: "Walk the dog" })
            server.create("reminder", { text: "Take out the trash" })
            server.create("reminder", { text: "Work out" })
            
            // server.create("list", { name: "Home" });
            // server.create("list", { name: "Work" });
            
            let homeList = server.create("list", { name: "Home" });
            server.create("reminder", { list: homeList, text: "Do taxes" });

            let workList = server.create("list", { name: "Work" });
            server.create("reminder", { list: workList, text: "Visit bank" });
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