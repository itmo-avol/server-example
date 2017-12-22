import * as Express from 'express';
import * as Path from 'path';
import * as Handlebars from 'express-handlebars';
import * as BodyParser from 'body-parser';
import {promisify} from 'util';
import * as Fs from 'fs';

const rootPath = Path.resolve( __dirname, '..' );
process.chdir( rootPath );

const app = Express();
app.listen( 8000 );

app.get(
	'/hi',
	( _request: Express.Request, response: Express.Response ) =>
	{
		response.send( String( new Date() ) );
	},
);

app.use( Express.static( Path.resolve( rootPath, 'public' ) ) );

app.engine(
	'.hbs',
	Handlebars(
		{
			defaultLayout: 'main',
			extname: '.hbs',
		},
	),
);
app.set( 'view engine', '.hbs' );

app.get(
	'/',
	( _request: Express.Request, response: Express.Response ) =>
	{
		response.render(
			'index',
			{
				message: 'Привет, Мир!',
				title: 'Главная страница',
			},
		);
	},
);
app.get(
	'/about',
	( _request: Express.Request, response: Express.Response ) =>
	{
		response.render(
			'about',
			{
				title: 'О сайте',
			},
		);
	},
);

const jsonParser = BodyParser.json();
const feedbacksFile = Path.join( rootPath, 'feedback.json' );

const readFile = promisify( Fs.readFile );
const writeFile = promisify( Fs.writeFile );

app.post(
	'/api/form/feedback',
	jsonParser,
	async ( request: Express.Request, response: Express.Response ) =>
	{
		const data = request.body as FormFeedbackData;
		let feedbacks: FormFeedbackData[];
		
		try
		{
			const content = await readFile( feedbacksFile, 'utf8' );
			feedbacks = JSON.parse( content );
		}
		catch ( _error )
		{
			feedbacks = [];
		}
		
		feedbacks.push( data );
		
		await writeFile(
			feedbacksFile,
			JSON.stringify( feedbacks ),
			'utf8',
		);
		
		response.send( 'OK' );
	},
);

interface FormFeedbackData
{
	name: string;
	message: string;
}
