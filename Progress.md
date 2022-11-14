

1. Current status
    - Local Installation of Backstage.io
    - Configure the backstage instance to support a database
    - Investigated out of the box features provided by a backstage instace
    - Work with catalog plugin: Understand how to create and add descriptor files in order to ingent a list entities into backstage catalog.
    - Understand and configure Techdocs plugin in order to render documentation. 
    - Investigate how search plugin is working. Extend its coverage to work with a newly developed plugin data.
    - Adapt Backstage Search to use postgresql engine (out of the box it it has Lunr which is not suitable for production)
    - Investigated ways to extend backstage instance (via plugins)
        - Created a plugin as a service which is independent of the backstage scope; but using the resources provided by backstage instance
            - Connect the plugin to a database (resource is provided by backstage-app)
            - Integrate plugin with backstage search tool. Dicovered the implications and how tos
        - Created a new plugin for Splunk tool.
        - Installed and configured Community SonarQube plugin. 
    - Investigate how to separate frontend and backend components of a backstage application. Document the process to create docker images for these components.

2. Focus (In progress)
    - Deploy of our current backstage instance using CloudFoundry into RaboWeb systems.
    - Document the necessary steps for keeping the backstage instance up to date along with installed plugins.

3. Future focus
    - Integrate with Raboweb system; Azure DevOps integration; Users!!!
    - Performance metrics!
    - Scalability & high availability


