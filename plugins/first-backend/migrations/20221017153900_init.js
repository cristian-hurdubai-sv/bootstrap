/**
 * @param {import('knex').Knex} knex
 */
 exports.up = async function up(knex) {
    return (
      knex.schema
        // randomUser
        .createTable('random_user', table => {
          table.comment('Main table for storing random users');
          table
            .uuid('id')
            .primary()
            .notNullable()
            .comment('Auto-generated ID of the user');
          table.string('first_name').notNullable();
          table.string('last_name').notNullable();
          table.string('email').notNullable();
          table.string('phone');
          table.string('avatar');
          table.string('gender');
          table.string('nat');
          table
            .string('target')
            .notNullable()
            .comment('The actual target of the location');
        })
        .alterTable('random_user', table => {
          table.unique(['email'], {
            indexName: 'radom_user_email_uniq',
          });
        })
    );
  };
  
  /**
   * @param {import('knex').Knex} knex
   */
  exports.down = async function down(knex) {
    return knex.schema
      .alterTable('random_user', table => {
        table.dropUnique([], 'radom_user_email_uniq');
      })
      .dropTable('random_user');
  };